/**
 * TypeScript declarations for Vapi Widget custom element
 */
declare namespace JSX {
  interface IntrinsicElements {
    'vapi-widget': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'assistant-id'?: string;
        'public-key'?: string;
        mode?: 'voice' | 'chat';
        theme?: 'light' | 'dark';
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center';
        size?: 'tiny' | 'compact' | 'full';
        'border-radius'?: 'none' | 'small' | 'medium' | 'large';
        'button-base-color'?: string;
        'button-accent-color'?: string;
        'main-label'?: string;
        'start-button-text'?: string;
        'end-button-text'?: string;
        'require-consent'?: 'true' | 'false';
        'show-transcript'?: 'true' | 'false';
      },
      HTMLElement
    >;
  }
}

