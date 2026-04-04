import '@pro/themes'

// ── Pro Components (data-driven, high-level) ──
import { ProTable } from '@pro/table'
import {
  ProForm,
  ModalForm,
  DrawerForm,
  StepsForm,
  QueryFilter,
  LightFilter,
  ProFormDependency,
  ProFormList,
  SchemaForm,
} from '@pro/form'
import { ProDescriptions } from '@pro/descriptions'
import { ProTree } from '@pro/tree'
import { ProTabs, ProTabPane } from '@pro/tabs'
import { ProTag } from '@pro/tag'
import { ProEmpty } from '@pro/empty'
import { ProResult } from '@pro/result'
import { ProLoading } from '@pro/loading'

// ── Base Components (Element Plus wrappers) ──
import { Input } from '@pro/input'
import { InputNumber } from '@pro/input-number'
import { Select } from '@pro/select'
import { Cascader } from '@pro/cascader'
import { TreeSelect } from '@pro/tree-select'
import { DatePicker } from '@pro/date-picker'
import { TimePicker } from '@pro/time-picker'
import { Switch } from '@pro/switch'
import { Radio, RadioGroup, RadioButton } from '@pro/radio'
import { Checkbox, CheckboxGroup, CheckboxButton } from '@pro/checkbox'
import { Rate } from '@pro/rate'
import { Slider } from '@pro/slider'
import { Upload } from '@pro/upload'
import { ColorPicker } from '@pro/color-picker'
import { AutoComplete } from '@pro/auto-complete'
import { Dialog } from '@pro/dialog'
import { Drawer } from '@pro/drawer'
import { Popover } from '@pro/popover'
import { Tooltip } from '@pro/tooltip'
import { Popconfirm } from '@pro/popconfirm'
import { Badge } from '@pro/badge'
import { Statistic } from '@pro/statistic'
import { Pagination } from '@pro/pagination'
import { Breadcrumb, BreadcrumbItem } from '@pro/breadcrumb'
import { Steps, Step } from '@pro/steps'
import { Divider } from '@pro/divider'
import { ProNavMenu } from '@pro/nav-menu'

import { checkDependencies } from '@pro/utils'
import ProConfigProvider from './pro-config-provider.vue'

import type { App } from 'vue'

// ── Re-exports: Pro Components ──
export { ProTable } from '@pro/table'
export {
  ProForm,
  ModalForm,
  DrawerForm,
  StepsForm,
  QueryFilter,
  LightFilter,
  ProFormDependency,
  ProFormList,
  SchemaForm,
} from '@pro/form'
export { ProDescriptions } from '@pro/descriptions'
export { ProTree } from '@pro/tree'
export { ProTabs, ProTabPane } from '@pro/tabs'
export { ProTag } from '@pro/tag'
export { ProEmpty } from '@pro/empty'
export { ProResult } from '@pro/result'
export { ProLoading } from '@pro/loading'
export { ProNavMenu } from '@pro/nav-menu'
export { ProConfigProvider }

// ── Re-exports: Base Components ──
export { Input } from '@pro/input'
export { InputNumber } from '@pro/input-number'
export { Select } from '@pro/select'
export { Cascader } from '@pro/cascader'
export { TreeSelect } from '@pro/tree-select'
export { DatePicker } from '@pro/date-picker'
export { TimePicker } from '@pro/time-picker'
export { Switch } from '@pro/switch'
export { Radio, RadioGroup, RadioButton } from '@pro/radio'
export { Checkbox, CheckboxGroup, CheckboxButton } from '@pro/checkbox'
export { Rate } from '@pro/rate'
export { Slider } from '@pro/slider'
export { Upload } from '@pro/upload'
export { ColorPicker } from '@pro/color-picker'
export { AutoComplete } from '@pro/auto-complete'
export { Dialog } from '@pro/dialog'
export { Drawer } from '@pro/drawer'
export { Popover } from '@pro/popover'
export { Tooltip } from '@pro/tooltip'
export { Popconfirm } from '@pro/popconfirm'
export { Badge } from '@pro/badge'
export { Statistic } from '@pro/statistic'
export { Pagination } from '@pro/pagination'
export { Breadcrumb, BreadcrumbItem } from '@pro/breadcrumb'
export { Steps, Step } from '@pro/steps'
export { Divider } from '@pro/divider'

// ── Composables ──
export { useProTable } from '@pro/table'
export { useProForm, useModalForm, useDrawerForm, useStepsForm } from '@pro/form'
export { useProDescriptions } from '@pro/descriptions'

// ── i18n ──
export { useProLocale, resolveMessage, PRO_LOCALE_KEY } from '@pro/hooks'

// ── Utils ──
export { checkDependencies } from '@pro/utils'

// ── Install ──
const components = [
  // Pro
  ProTable,
  ProForm,
  ModalForm,
  DrawerForm,
  StepsForm,
  QueryFilter,
  LightFilter,
  ProFormDependency,
  ProFormList,
  SchemaForm,
  ProDescriptions,
  ProTree,
  ProTabs,
  ProTabPane,
  ProTag,
  ProEmpty,
  ProResult,
  ProLoading,
  ProNavMenu,
  ProConfigProvider,
  // Base
  Input,
  InputNumber,
  Select,
  Cascader,
  TreeSelect,
  DatePicker,
  TimePicker,
  Switch,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxGroup,
  CheckboxButton,
  Rate,
  Slider,
  Upload,
  ColorPicker,
  AutoComplete,
  Dialog,
  Drawer,
  Popover,
  Tooltip,
  Popconfirm,
  Badge,
  Statistic,
  Pagination,
  Breadcrumb,
  BreadcrumbItem,
  Steps,
  Step,
  Divider,
]

export const proComponentsPlugin = {
  install(app: App) {
    checkDependencies()
    components.forEach((component) => {
      const name = (component as { name?: string }).name
      if (name) {
        app.component(name, component)
      }
    })
  },
}

// ── Types (separate group, always last) ──
export type { RequestParams, RequestResult, StatusType, ValueType } from '@pro/utils'
export type { ProFieldDef, StepFormDef, ProFormConfig, FormLayout, ProFormRule } from '@pro/utils'
export type { ProColumnDef } from '@pro/utils'
export type { UseProTableReturn } from '@pro/table'
export type {
  UseProFormReturn,
  UseModalFormReturn,
  UseDrawerFormReturn,
  UseStepsFormReturn,
} from '@pro/form'
export type { DescriptionItem, UseProDescriptionsReturn } from '@pro/descriptions'
export type { ProLocaleContext, I18nLike } from '@pro/hooks'
export type { ProLoadingProps, LoadingState } from '@pro/loading'
export type { ProTagProps } from '@pro/tag'
export type { ProEmptyProps, EmptyType } from '@pro/empty'
export type { ProResultProps, ResultType } from '@pro/result'
export type { ProTabsProps } from '@pro/tabs'
