import { defineConfig, presetUno, presetAttributify, presetIcons, presetTypography, presetWebFonts, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      // border
      'border-base': 'border-$c-border',
      'border-dark': 'border-$c-border-dark',
      'border-strong': 'border-$c-text-base',
      'border-bg-base': 'border-$c-bg-base',
      'border-primary-light': 'border-$c-primary-light',

      // text colors
      'text-base': 'text-$c-text-base',
      'text-inverted': 'text-$c-bg-base',

      // background colors
      'bg-base': 'bg-$c-bg-base',
      'bg-border': 'bg-$c-border',
      'bg-active': 'bg-$c-bg-active',
      'bg-secondary': 'bg-$c-text-secondary',
      'bg-secondary-light': 'bg-$c-text-secondary-light',
      'bg-primary-light': 'bg-$c-primary-light',
      'bg-primary-fade': 'bg-$c-primary-fade',
      'bg-card': 'bg-$c-bg-card',
      'bg-code': 'bg-$c-bg-code',
      'bg-dm': 'bg-$c-bg-dm',

      // input
      'input-base-focus': 'focus:outline-none focus:border-$c-primary',
      'input-base-disabled': 'disabled:pointer-events-none disabled:bg-gray-500/5 disabled:text-gray-500/50',
      'input-base': 'p2 rounded w-full bg-transparent border border-dark input-base-focus input-base-disabled',
      'input-error': 'border-$c-error focus:(outline-offset-0 outline-$c-error outline-1px)',

      // buttons
      'btn-base': 'cursor-pointer disabled:pointer-events-none disabled:bg-$c-bg-btn-disabled disabled:text-$c-text-btn-disabled',
      'btn-text': 'btn-base px-4 py-2 text-$c-primary hover:text-$c-primary-active',
      'btn-solid': 'btn-base px-4 py-2 rounded text-inverted bg-$c-primary hover:bg-$c-primary-active',
      'btn-danger': 'btn-base px-4 py-2 rounded text-white bg-$c-danger hover:bg-$c-danger-active',
      'btn-outline': 'btn-base px-4 py-2 rounded text-$c-primary border border-$c-primary hover:bg-$c-primary hover:text-inverted',
    },
    // 鼠标 hover group 元素或者 group 元素被激活，添加 r 样式，类名为 xxy-group-hover[:-][r]
    [/^xxy-group-hover[:-]([a-z0-9\/-]+)$/, ([, r]) => `media-mouse-group-hover-${r} group-active-${r}`],
  ],
  presets: [
    presetUno({
      attributifyPseudo: true, // 将伪选择器生成为 [group=""] 而不是 .group
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'color': 'inherit',
        'min-width': '1.2em', // 避免在拥挤的情况下压碎图标
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: 'var(--c-primary)',
        active: 'var(--c-primary-active)',
      },
      danger: {
        DEFAULT: 'var(--c-danger)',
        active: 'var(--c-danger-active)',
      },
    },
  },
})
