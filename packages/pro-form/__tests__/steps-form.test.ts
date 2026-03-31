import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ElementPlus from 'element-plus'
import StepsForm from '../src/components/StepsForm.vue'
import { useStepsForm } from '../src/composables/use-steps-form'

import type { StepFormDef } from '@pro/utils'

function createSteps(): StepFormDef[] {
  return [
    {
      title: 'Basic Info',
      fields: [
        {
          dataIndex: 'name',
          title: 'Name',
          valueType: 'text',
          rules: [{ required: true, message: 'Name is required' }],
        },
        { dataIndex: 'email', title: 'Email', valueType: 'text' },
      ],
    },
    {
      title: 'Details',
      fields: [
        { dataIndex: 'age', title: 'Age', valueType: 'number' },
        { dataIndex: 'bio', title: 'Bio', valueType: 'textarea' },
      ],
    },
    {
      title: 'Confirm',
      fields: [{ dataIndex: 'agree', title: 'I agree', valueType: 'switch' }],
    },
  ]
}

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(StepsForm, {
    props,
    global: {
      plugins: [ElementPlus],
    },
  })
}

describe('useStepsForm', () => {
  describe('initialization', () => {
    it('should start at step 0', () => {
      const { currentStep } = useStepsForm({ steps: createSteps() })
      expect(currentStep.value).toBe(0)
    })

    it('should compute total steps', () => {
      const { totalSteps } = useStepsForm({ steps: createSteps() })
      expect(totalSteps.value).toBe(3)
    })

    it('should report first step correctly', () => {
      const { isFirstStep } = useStepsForm({ steps: createSteps() })
      expect(isFirstStep.value).toBe(true)
    })

    it('should report not last step on first step', () => {
      const { isLastStep } = useStepsForm({ steps: createSteps() })
      expect(isLastStep.value).toBe(false)
    })

    it('should expose current step fields', () => {
      const { currentFields } = useStepsForm({ steps: createSteps() })
      expect(currentFields.value).toHaveLength(2)
      expect(currentFields.value[0].dataIndex).toBe('name')
    })
  })

  describe('navigation', () => {
    it('should advance to next step', async () => {
      const { currentStep, nextStep, currentFields } = useStepsForm({ steps: createSteps() })
      await nextStep()
      expect(currentStep.value).toBe(1)
      expect(currentFields.value[0].dataIndex).toBe('age')
    })

    it('should go back to previous step', async () => {
      const { currentStep, nextStep, prevStep } = useStepsForm({ steps: createSteps() })
      await nextStep()
      expect(currentStep.value).toBe(1)
      prevStep()
      expect(currentStep.value).toBe(0)
    })

    it('should not go below step 0', () => {
      const { currentStep, prevStep } = useStepsForm({ steps: createSteps() })
      prevStep()
      expect(currentStep.value).toBe(0)
    })

    it('should identify last step', async () => {
      const { isLastStep, nextStep } = useStepsForm({ steps: createSteps() })
      await nextStep()
      await nextStep()
      expect(isLastStep.value).toBe(true)
    })

    it('should go to specific step via goToStep', () => {
      const { currentStep, goToStep } = useStepsForm({ steps: createSteps() })
      goToStep(2)
      expect(currentStep.value).toBe(2)
    })

    it('should clamp goToStep to valid range — upper bound', () => {
      const { currentStep, goToStep } = useStepsForm({ steps: createSteps() })
      goToStep(99)
      expect(currentStep.value).toBe(2)
    })

    it('should clamp goToStep to valid range — lower bound', () => {
      const { currentStep, goToStep } = useStepsForm({ steps: createSteps() })
      goToStep(-5)
      expect(currentStep.value).toBe(0)
    })
  })

  describe('form values', () => {
    it('should maintain form values across steps', async () => {
      const { formValues, nextStep } = useStepsForm({
        steps: createSteps(),
        initialValues: { name: 'Alice', age: 30 },
      })
      expect(formValues.value.name).toBe('Alice')
      await nextStep()
      expect(formValues.value.name).toBe('Alice')
      expect(formValues.value.age).toBe(30)
    })
  })

  describe('submit', () => {
    it('should call onSubmit with merged values from all steps', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const { nextStep, submit } = useStepsForm({
        steps: createSteps(),
        initialValues: { name: 'Alice', age: 30, agree: true },
        onSubmit,
      })
      await nextStep()
      await nextStep()
      await submit()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Alice', age: 30, agree: true }),
      )
    })
  })

  describe('reset', () => {
    it('should reset to step 0 and restore initial values', async () => {
      const { currentStep, nextStep, resetFields, formValues } = useStepsForm({
        steps: createSteps(),
        initialValues: { name: 'Original' },
      })
      await nextStep()
      formValues.value = { ...formValues.value, name: 'Changed' }
      resetFields()
      expect(currentStep.value).toBe(0)
      expect(formValues.value.name).toBe('Original')
    })
  })
})

describe('StepsForm component', () => {
  describe('rendering', () => {
    it('should render el-steps with correct number of steps', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const steps = wrapper.findAll('.el-step')
      expect(steps).toHaveLength(3)
    })

    it('should render form fields for current step only', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems).toHaveLength(2)
    })

    it('should show Next button on non-last steps', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      expect(wrapper.find('.pro-steps-form__next').exists()).toBe(true)
      expect(wrapper.find('.pro-steps-form__submit').exists()).toBe(false)
    })

    it('should hide Prev button on first step', () => {
      const wrapper = createWrapper({ steps: createSteps() })
      expect(wrapper.find('.pro-steps-form__prev').exists()).toBe(false)
    })
  })

  describe('navigation via buttons', () => {
    it('should advance to next step when Next is clicked', async () => {
      const wrapper = createWrapper({ steps: createSteps() })
      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await nextTick()

      const formItems = wrapper.findAll('.el-form-item')
      expect(formItems.length).toBeGreaterThanOrEqual(2)
    })

    it('should show Submit button on last step', async () => {
      // Provide initial values to pass validation
      const wrapper = createWrapper({
        steps: createSteps(),
        initialValues: { name: 'Test', email: 'test@test.com' },
      })

      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await flushPromises()
      await nextTick()

      const nextBtn2 = wrapper.find('.pro-steps-form__next')
      await nextBtn2.trigger('click')
      await flushPromises()
      await nextTick()

      expect(wrapper.find('.pro-steps-form__submit').exists()).toBe(true)
      expect(wrapper.find('.pro-steps-form__next').exists()).toBe(false)
    })

    it('should show Prev button on non-first steps', async () => {
      const wrapper = createWrapper({
        steps: createSteps(),
        initialValues: { name: 'Test' },
      })
      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await flushPromises()
      await nextTick()
      expect(wrapper.find('.pro-steps-form__prev').exists()).toBe(true)
    })
  })

  describe('submit', () => {
    it('should call onSubmit when Submit button is clicked on last step', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true)
      const wrapper = createWrapper({
        steps: createSteps(),
        initialValues: { name: 'Test', age: 25, agree: true },
        onSubmit,
      })

      const nextBtn = wrapper.find('.pro-steps-form__next')
      await nextBtn.trigger('click')
      await flushPromises()
      await nextTick()
      const nextBtn2 = wrapper.find('.pro-steps-form__next')
      await nextBtn2.trigger('click')
      await flushPromises()
      await nextTick()

      const submitBtn = wrapper.find('.pro-steps-form__submit')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(onSubmit).toHaveBeenCalled()
    })
  })
})
