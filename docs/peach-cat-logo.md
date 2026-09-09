# 桃子猫透明 logo

- 工具：内置 imagegen，编辑 / background-extraction 模式；未使用 CLI 或另行付费 API。
- 输入：`public/peach-cat-avatar.png`，用户提供的原图。
- 输出：`public/peach-cat-logo.png`，1254 × 1254 RGBA PNG，确认存在透明像素。
- 使用范围：导航栏 logo；关于我继续使用原头像文件。
- 显示尺寸：手机 48px，640px 以上 52px；完整展示主体，去掉图片圆角和方框描边。旧原图保留。
- 说明：这是 imagegen 编辑输出，不是逐像素无损抠图。
- 验证：定向 ESLint、差异检查通过；浏览器确认 52px 桌面和 48px 手机尺寸、深浅背景透明效果、390px 视口无横向溢出，控制台无错误。仅本地修改，未提交、推送或部署。

## 最终提示词

```text
Use case: background-extraction.
Asset type: transparent website navigation logo.
Image 1 is the edit target. Extract the exact peach-costumed orange cat from this image onto a genuinely transparent RGBA background. Preserve the original cat face, expression, proportions, fur details, peach colors and texture, both green leaves, paws, necklace and tiny peach bag. Do not redesign, redraw, stylize, add elements or change the pose. Keep the complete peach-cat silhouette and leaves, with clean fine edges and no white matte or halo. Fit the full subject prominently in a square canvas with only a small even transparent margin, so it reads clearly at 48–52 pixels. No solid background, no shadow plate, no checkerboard painted into the image. Return a PNG with actual alpha transparency.
```
