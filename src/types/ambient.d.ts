// Ambient TypeScript Definitions for KM100 Inventory System
// Enables full VS Code IntelliSense and zero-error diagnostics without node_modules

declare namespace React {
  export type ReactNode = any;
  export type ReactElement<P = any, T = any> = any;
  export type ComponentType<P = {}> = any;
  export type Component<P = {}, S = {}> = any;
  export type FC<P = {}> = ((props: P) => any) & { displayName?: string };
  export type FunctionComponent<P = {}> = FC<P>;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  export type CSSProperties = { [key: string]: any };

  export interface ChangeEvent<T = any> {
    target: T & { value: string; files?: FileList | null };
    currentTarget: T;
  }

  export interface FormEvent<T = any> {
    preventDefault: () => void;
    stopPropagation: () => void;
    target: T;
  }

  export interface MouseEvent<T = any> {
    preventDefault: () => void;
    stopPropagation: () => void;
    target: T;
  }

  export interface KeyboardEvent<T = any> {
    key: string;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    preventDefault: () => void;
    stopPropagation: () => void;
  }

  export interface DragEvent<T = any> {
    preventDefault: () => void;
    stopPropagation: () => void;
    dataTransfer: any;
  }

  export interface TouchEvent<T = any> {
    preventDefault: () => void;
    stopPropagation: () => void;
  }

  export interface FocusEvent<T = any> {
    target: T;
    currentTarget: T;
  }

  export interface SVGProps<T = any> {
    [key: string]: any;
  }

  export interface HTMLAttributes<T = any> {
    [key: string]: any;
  }

  export interface DetailedHTMLProps<E, T> {
    [key: string]: any;
  }

  export interface InputHTMLAttributes<T> {
    [key: string]: any;
  }

  export interface ButtonHTMLAttributes<T> {
    [key: string]: any;
  }

  export interface SelectHTMLAttributes<T> {
    [key: string]: any;
  }

  export function useState<T>(
    initialState: T | (() => T),
  ): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly any[],
  ): void;
  export function useMemo<T>(
    factory: () => T,
    deps: readonly any[] | undefined,
  ): T;
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: readonly any[],
  ): T;
  export function useDeferredValue<T>(value: T): T;
  export function useTransition(): [boolean, (callback: () => void) => void];
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = any>(): { current: T | undefined };
  export function useContext<T>(context: any): T;
  export function useReducer<R extends (...args: any[]) => any>(
    reducer: R,
    initialState: any,
  ): [any, (action: any) => void];
  export function useLayoutEffect(
    effect: () => void | (() => void),
    deps?: readonly any[],
  ): void;
  export function createElement(
    type: any,
    props?: any,
    ...children: any[]
  ): any;
  export function cloneElement(
    element: any,
    props?: any,
    ...children: any[]
  ): any;
  export function createContext<T>(defaultValue: T): any;
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: any) => any,
  ): any;
  export function memo<T>(Component: T): T;

  export const StrictMode: any;
  export const Fragment: any;
  export const Suspense: any;
}

declare namespace ReactDOM {
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  export function createRoot(
    container: Element | DocumentFragment | null,
  ): Root;
  export function render(
    element: React.ReactElement,
    container: Element | null,
  ): void;
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      div: any;
      span: any;
      p: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      button: any;
      input: any;
      select: any;
      option: any;
      textarea: any;
      form: any;
      label: any;
      table: any;
      thead: any;
      tbody: any;
      tr: any;
      th: any;
      td: any;
      img: any;
      svg: any;
      path: any;
      header: any;
      footer: any;
      nav: any;
      aside: any;
      section: any;
      main: any;
      dialog: any;
      a: any;
      ul: any;
      ol: any;
      li: any;
      [elemName: string]: any;
    }
  }
}

declare module "react" {
  export = React;
  export default React;
}

declare module "react-dom" {
  export = ReactDOM;
  export default ReactDOM;
}

declare module "react-dom/client" {
  export = ReactDOM;
  export default ReactDOM;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  export namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module "react/jsx-dev-runtime" {
  export const jsxDEV: any;
  export const Fragment: any;
  export namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module "lucide-react" {
  import * as React from "react";
  export interface LucideProps {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  export type Icon = React.FC<LucideProps>;
  export const ArrowUpDown: Icon;
  export const ChevronUp: Icon;
  export const ChevronDown: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const Edit: Icon;
  export const Edit2: Icon;
  export const Trash2: Icon;
  export const Building: Icon;
  export const Package: Icon;
  export const Layers: Icon;
  export const ShieldCheck: Icon;
  export const ChevronRight: Icon;
  export const ChevronLeft: Icon;
  export const ArrowRight: Icon;
  export const ArrowLeft: Icon;
  export const CheckCircle2: Icon;
  export const PackageX: Icon;
  export const AlertTriangle: Icon;
  export const FileSpreadsheet: Icon;
  export const Sliders: Icon;
  export const Settings: Icon;
  export const Download: Icon;
  export const Upload: Icon;
  export const RefreshCw: Icon;
  export const RotateCcw: Icon;
  export const Printer: Icon;
  export const Search: Icon;
  export const Filter: Icon;
  export const X: Icon;
  export const Check: Icon;
  export const Sparkles: Icon;
  export const LayoutDashboard: Icon;
  export const Sun: Icon;
  export const Moon: Icon;
  export const Menu: Icon;
  export const Tag: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const HelpCircle: Icon;
  export const Info: Icon;
  export const MoreVertical: Icon;
  export const MoreHorizontal: Icon;
  export const FileUp: Icon;
  export const FileDown: Icon;
  export const Database: Icon;
  export const Folder: Icon;
  export const ExternalLink: Icon;
  export const FileText: Icon;
  export const Copy: Icon;
  export const Save: Icon;
  export const LogOut: Icon;
  export const Lock: Icon;
  export const User: Icon;
  export const UserCheck: Icon;
  export const UserPlus: Icon;
  export const Users: Icon;
  export const UserCog: Icon;
  export const GraduationCap: Icon;
  export const Key: Icon;
  export const KeyRound: Icon;
  export const Shield: Icon;
  export const Mail: Icon;
  const defaultIcon: Icon;
  export default defaultIcon;
}

declare module "xlsx" {
  export const utils: any;
  export const read: any;
  export const write: any;
  export const writeFile: any;
  export const version: string;
  const XLSX: any;
  export default XLSX;
}

declare module "@supabase/supabase-js" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any,
  ): any;
  export type SupabaseClient = any;
  export type RealtimeChannel = any;
  const defaultSupabase: any;
  export default defaultSupabase;
}

declare module "exceljs" {
  export class Workbook {
    creator: string;
    lastModifiedBy: string;
    created: Date;
    modified: Date;
    addWorksheet(name: string, options?: any): any;
    addImage(options: any): number;
    xlsx: {
      writeBuffer(): Promise<ArrayBuffer>;
      load(data: any): Promise<any>;
    };
    [key: string]: any;
  }
  const ExcelJS: any;
  export default ExcelJS;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
