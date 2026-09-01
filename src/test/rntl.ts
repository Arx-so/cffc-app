/**
 * Seletores para casos que o RNTL não cobre bem.
 *
 * `UNSAFE_getAllByType(Pressable)` não funciona: o React Native exporta um
 * wrapper memo cuja referência difere do tipo renderizado, e `Pressable` não
 * define `displayName` — só `name`. Filtrar por `onPress` também engana, porque
 * um Pressable pode receber `onPress={undefined}` e continuar na árvore.
 *
 * `findAll(predicate)` do RNTL não é equivalente a `findAll(() => true).filter()`
 * — o primeiro para na correspondência mais rasa. Todos os helpers aqui usam a
 * segunda forma.
 */
import type { ReactTestInstance } from "react-test-renderer";

const allNodes = (root: ReactTestInstance): ReactTestInstance[] =>
  root.findAll(() => true, { deep: true });

const componentName = (node: ReactTestInstance): string | undefined => {
  if (typeof node.type === "string") return undefined;
  const t = node.type as { displayName?: string; name?: string };
  return t?.displayName ?? t?.name;
};

/** Nós compostos com o nome dado (ex.: "Pressable", "TouchableOpacity"). */
export const findByComponentName = (root: ReactTestInstance, name: string) =>
  allNodes(root).filter((n) => componentName(n) === name);

/** Todos os `Pressable` da árvore, na ordem de renderização. */
export const findPressables = (root: ReactTestInstance) =>
  findByComponentName(root, "Pressable");

/**
 * Nós host cujo estilo contém o valor dado. Restringir a host evita contar duas
 * vezes: um `<View>` aparece como nó composto e como nó host.
 */
export const findHostByStyleValue = (root: ReactTestInstance, value: string) =>
  allNodes(root).filter(
    (n) => typeof n.type === "string" && JSON.stringify(n.props?.style ?? null).includes(value),
  );

/** Nós host com um handler `onPress` de fato ligado. */
export const findPressHandlers = (root: ReactTestInstance) =>
  allNodes(root).filter((n) => typeof n.props?.onPress === "function");
