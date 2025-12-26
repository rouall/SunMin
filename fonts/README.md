# 本地字体文件

这个目录包含了网站使用的本地字体文件，替代了原来的Google字体CDN链接。

## 包含的字体

### Space Grotesk
- **Light (300)**: `space-grotesk/SpaceGrotesk-Light.woff2`
- **Bold (700)**: `space-grotesk/SpaceGrotesk-Bold.woff2`
- **许可证**: SIL Open Font License 1.1
- **来源**: https://github.com/floriankarsten/space-grotesk

### JetBrains Mono
- **Thin (100)**: `jetbrains-mono/JetBrainsMono-Thin.woff2`
- **Light (300)**: `jetbrains-mono/JetBrainsMono-Light.woff2`
- **许可证**: SIL Open Font License 1.1
- **来源**: https://github.com/JetBrains/JetBrainsMono

## 使用方法

字体通过 `fonts.css` 文件加载，已在 `index.html` 中引用：

```html
<link rel="stylesheet" href="./fonts/fonts.css">
```

## 优势

- ✅ 无需依赖Google字体CDN
- ✅ 提高网站加载速度
- ✅ 避免网络连接问题
- ✅ 更好的隐私保护
- ✅ 离线可用