declare module '*.css' {
  const styles: { [key: string]: string };
  export default styles;
}

declare module '*.scss' {
  const styles: { [key: string]: string };
  export default styles;
}

declare module '*.sass' {
  const styles: { [key: string]: string };
  export default styles;
}

declare module '*.less' {
  const styles: { [key: string]: string };
  export default styles;
}

// For style objects in React components
declare module 'csstype' {
  interface Properties {
    [key: string]: any;
  }
} 