/**
 * English (US) locale messages for Pro Components.
 *
 * Key structure: `pro.{component}.{feature}.{key}`
 * All keys must have a corresponding entry in zh-CN.ts.
 */
export const enUS = {
  pro: {
    table: {
      queryFilter: {
        search: 'Search',
        reset: 'Reset',
        expand: 'Expand',
        collapse: 'Collapse',
      },
      pagination: {
        showing: 'Showing {start}\u2013{end} of {total}',
      },
      empty: 'No Data',
      loading: 'Loading\u2026',
      columnSetting: {
        title: 'Columns',
        pinLeft: 'Pin Left',
        pinRight: 'Pin Right',
        unpin: 'Unpin',
      },
      density: {
        compact: 'Compact',
        default: 'Default',
        relaxed: 'Relaxed',
      },
      toolbar: {
        reload: 'Reload',
        fullscreen: 'Fullscreen',
      },
    },
    form: {
      submit: 'Submit',
      reset: 'Reset',
      cancel: 'Cancel',
      steps: {
        prev: 'Previous',
        next: 'Next',
        submit: 'Submit',
        stepOf: 'Step {current} of {total}',
      },
      validation: {
        required: '{field} is required',
        email: 'Invalid email format',
        minLength: 'Minimum {min} characters',
        maxLength: 'Maximum {max} characters',
      },
      select: {
        placeholder: 'Please select\u2026',
      },
      date: {
        placeholder: 'Select date',
      },
    },
    descriptions: {
      empty: '\u2014',
    },
    common: {
      confirm: 'Confirm',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      create: 'Create',
      update: 'Update',
      save: 'Save',
      success: 'Operation successful',
      networkError: 'Network error, please try again',
      timeout: 'Request timeout',
      required: 'Required',
      noResults: 'No results found',
      loading: 'Loading\u2026',
      aria: {
        expand: 'Expand',
        collapse: 'Collapse',
        required: 'Required field',
        error: 'Error: {message}',
        close: 'Close',
      },
    },
  },
} as const
