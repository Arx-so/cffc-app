/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-native/extend-expect";
import { configure } from "@testing-library/react-native";

// Um render de componente RN leva 200-400ms neste ambiente; com as suítes em
// paralelo o default de 1s do `waitFor` estoura por contenção, não por bug.
configure({ asyncUtilTimeout: 5000 });

// src/config/supabase.ts throws at import time when these are missing.
process.env.EXPO_PUBLIC_SUPABASE_URL ??= "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
    __store: store,
  };
});

// O default export do toast é usado das duas formas: `Toast.show(...)` na lógica
// e `<Toast />` dentro do ToastHost. O mock precisa ser componente E ter os métodos.
jest.mock("react-native-toast-message", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Toast: any = ({ ...props }: any) =>
    React.createElement(View, { ...props, testID: props.testID ?? "ToastContainer" });
  Toast.displayName = "Toast";
  Toast.show = jest.fn();
  Toast.hide = jest.fn();
  return { __esModule: true, default: Toast };
});

/**
 * Um único objeto de router compartilhado entre `router` e `useRouter()`, para o
 * teste conseguir afirmar a navegação sem precisar remockar o módulo. Métodos
 * são `jest.fn` e são limpos entre os testes pelo `clearMocks` abaixo.
 */
jest.mock("expo-router", () => {
  const React = require("react");
  const { View } = require("react-native");

  const makeNamed = (name: string) =>
    Object.assign((_props: any) => null, { displayName: name });

  const makeNavigator = (name: string) => {
    const Navigator = ({ children, ...props }: any) =>
      React.createElement(View, { ...props, testID: props.testID ?? name }, children);
    Navigator.displayName = name;
    const Screen = makeNamed(`${name}.Screen`);
    return Object.assign(Navigator, { Screen });
  };

  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
  };
  return {
    router,
    useRouter: jest.fn(() => router),
    useLocalSearchParams: jest.fn(() => ({})),
    useSegments: jest.fn(() => []),
    usePathname: jest.fn(() => "/"),
    useNavigation: jest.fn(() => ({ setOptions: jest.fn(), addListener: jest.fn() })),
    // O real roda quando a tela ganha foco. Um `jest.fn()` inerte nunca dispara,
    // e um que chama o callback a cada render cria loop de invalidação. `useEffect`
    // com o callback nas deps é o equivalente honesto: o app já o memoiza.
    useFocusEffect: jest.fn((callback: any) => React.useEffect(callback, [callback])),
    Link: "Link",
    // Navegadores como componentes de verdade: `Screen` não renderiza nada, mas
    // fica na árvore com suas `options` intactas, que é o que o teste precisa
    // inspecionar (tabBarButton, tabBarIcon, header, href: null...).
    Stack: makeNavigator("Stack"),
    Tabs: makeNavigator("Tabs"),
    Redirect: makeNamed("Redirect"),
    SplashScreen: { preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() },
  };
});

// O keyboard-controller depende de módulos nativos; os wrappers do app só
// repassam props, então stubs que preservam as props bastam para asseri-las.
jest.mock("react-native-keyboard-controller", () => {
  const React = require("react");
  const { View } = require("react-native");
  const passthrough = (name: string) =>
    Object.assign(
      ({ children, ...props }: any) => React.createElement(View, { ...props, testID: props.testID ?? name }, children),
      { displayName: name },
    );
  return {
    KeyboardAwareScrollView: passthrough("KeyboardAwareScrollView"),
    KeyboardStickyView: passthrough("KeyboardStickyView"),
    KeyboardAvoidingView: passthrough("KeyboardAvoidingView"),
    KeyboardProvider: passthrough("KeyboardProvider"),
    useReanimatedKeyboardAnimation: () => ({ height: { value: 0 }, progress: { value: 0 } }),
    useKeyboardHandler: jest.fn(),
  };
});

// Reanimated 4 delega para react-native-worklets, cuja parte nativa não existe
// sob o jest. O mock do próprio reanimated não cobre isso, então o runtime de
// worklets é stubado para rodar o worklet direto no JS.
jest.mock("react-native-worklets", () => ({
  createWorkletRuntime: () => ({}),
  runOnJS: (fn: any) => fn,
  runOnUI: (fn: any) => fn,
  runOnRuntime: (_rt: any, fn: any) => fn,
  scheduleOnRN: (fn: any, ...args: any[]) => fn?.(...args),
  scheduleOnUI: (fn: any) => fn?.(),
  isWorkletFunction: () => false,
  makeShareableCloneRecursive: (v: any) => v,
  executeOnUIRuntimeSync: (fn: any) => fn,
  serializable: (v: any) => v,
  createSerializable: (v: any) => v,
}));

// O mock que o reanimated 4 publica ainda importa os módulos reais de animação,
// que dependem de globals do runtime nativo. O app só usa `Animated.View` e
// `useAnimatedStyle`, então um stub direto é mais estável — e mais honesto:
// avalia o estilo animado de verdade, só que sincronamente.
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View, Text, ScrollView, Image, FlatList } = require("react-native");
  const wrap = (Component: any, name: string) =>
    Object.assign(
      React.forwardRef((props: any, ref: any) => React.createElement(Component, { ...props, ref })),
      { displayName: `Animated.${name}` },
    );
  const Animated = {
    View: wrap(View, "View"),
    Text: wrap(Text, "Text"),
    ScrollView: wrap(ScrollView, "ScrollView"),
    Image: wrap(Image, "Image"),
    FlatList: wrap(FlatList, "FlatList"),
    createAnimatedComponent: (C: any) => wrap(C, C?.displayName ?? "Component"),
  };
  const sharedValue = (initial: any) => ({ value: initial });
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useSharedValue: sharedValue,
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => () => {},
    withTiming: (v: unknown) => v,
    withSpring: (v: unknown) => v,
    withDelay: (_d: number, v: unknown) => v,
    withSequence: (...v: unknown[]) => v[v.length - 1],
    withRepeat: (v: unknown) => v,
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
    interpolate: (x: number) => x,
    Easing: new Proxy({}, { get: () => () => {} }),
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
  };
});

// @expo/vector-icons carrega a fonte de forma assíncrona e faz setState depois
// que o teste acabou — é a origem dos avisos de act() e do worker que não encerra.
// O stub preserva as props (name/size/color), que é o que os testes afirmam.
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const makeIconSet = (name: string) => {
    const Icon = (props: any) =>
      React.createElement(Text, { ...props, testID: props.testID ?? `icon-${props.name}` });
    Icon.displayName = name;
    Icon.loadFont = jest.fn(async () => {});
    Icon.font = {};
    return Icon;
  };
  return new Proxy(
    {},
    {
      get: (target: any, prop: string) => {
        if (prop === "__esModule") return true;
        if (!target[prop]) target[prop] = makeIconSet(prop);
        return target[prop];
      },
    },
  );
});

// RN agenda animation frames em Pressable/Animated. Sem `unref` esses timers
// seguram o event loop e o worker do jest não encerra ao fim da suíte.
global.requestAnimationFrame = ((cb: any) => {
  const timer: any = setTimeout(cb, 0);
  timer?.unref?.();
  return timer;
}) as typeof global.requestAnimationFrame;
global.cancelAnimationFrame = ((timer: any) => clearTimeout(timer)) as typeof global.cancelAnimationFrame;
