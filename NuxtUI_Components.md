# 元件開發規範

## 優先使用 Nuxt UI 元件

在開發專案時，**優先使用** `@.claude/3.components/` 目錄下已記錄的 Nuxt UI v3 元件。此目錄包含 54 個官方元件的完整文件，涵蓋：

- **Layout**: App, Container
- **Element**: Button, Link, Icon, Avatar, Badge, Card, Chip 等
- **Form**: Form, FormField, Input, Textarea, Select, SelectMenu, Checkbox, Radio, Switch 等
- **Navigation**: NavigationMenu, Breadcrumb, Tabs, Pagination, Dropdown 等
- **Overlay**: Modal, Slideover, Drawer, Popover, Tooltip, ContextMenu 等
- **Feedback**: Toast, Alert, Progress, Skeleton 等
- **Data Display**: Table, Tree, Timeline, Calendar, Carousel 等

## 開發流程

### 1. 查找現有元件

- 在實作功能前，先檢查 `.claude/3.components/` 目錄
- 確認是否有符合需求的 Nuxt UI 元件
- 參考對應的 `.md` 檔案了解用法、API 和範例

### 2. 使用現有元件

- 嚴格遵循元件文件中的使用方式
- 透過 `props`、`slots`、`ui` prop 進行客製化
- 優先使用元件提供的變體（variant）、顏色（color）、尺寸（size）等配置

### 3. 自訂元件開發

**僅在以下情況**才建立新的自訂元件：
- Nuxt UI 未提供相應功能的元件
- 現有元件無法透過組合或客製化滿足需求
- 需要跨專案重複使用的特定業務邏輯元件

自訂元件應遵循以下原則：
- 盡可能基於 Nuxt UI 元件進行組合或擴展
- 遵循 `@CODING_STYLE.md` 的規範
- 保持與 Nuxt UI 設計系統的一致性
- 使用 TypeScript 定義清晰的介面

## 範例

```vue
<!-- ✅ 正確：使用 Nuxt UI 元件 -->
<UButton
  icon="i-lucide-plus"
  color="primary"
  @click="handleAdd"
>
  新增項目
</UButton>

<!-- ✅ 正確：透過 ui prop 客製化 -->
<UInput
  v-model="email"
  :ui="{ base: 'custom-class' }"
  placeholder="輸入電子郵件"
/>

<!-- ⚠️ 謹慎：確認 Nuxt UI 無提供後才建立 -->
<CustomComplexDataGrid :data="items" />
```

## 重點提醒

- **不要重複造輪子**：Nuxt UI 已提供高品質、可訪問性佳的元件
- **保持一致性**：使用同一套元件系統確保 UI/UX 的一致性
- **效能最佳化**：Nuxt UI 元件已針對效能進行優化
- **維護性**：使用官方元件減少日後維護成本