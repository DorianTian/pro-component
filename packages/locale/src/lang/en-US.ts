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
      editable: {
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        addRow: 'Add Row',
        actions: 'Actions',
        deleteConfirm: 'Are you sure you want to delete this row?',
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
      input: {
        placeholder: 'Please enter\u2026',
      },
      select: {
        placeholder: 'Please select\u2026',
      },
      date: {
        placeholder: 'Select date',
      },
      image: {
        placeholder: 'Image URL',
      },
    },
    descriptions: {
      empty: '\u2014',
      switch: {
        on: 'Enabled',
        off: 'Disabled',
      },
    },
    tree: {
      search: {
        placeholder: 'Search...',
      },
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
    },
    loading: {
      empty: {
        description: 'No data',
      },
      error: {
        title: 'Something went wrong',
        retry: 'Retry',
      },
    },
    tabs: {
      closeConfirm: {
        title: 'Confirm',
        message: 'Are you sure you want to close this tab?',
        ok: 'OK',
        cancel: 'Cancel',
      },
    },
    result: {
      success: {
        title: 'Operation Succeeded',
        subtitle: 'Your request has been processed successfully.',
      },
      error: {
        title: 'Operation Failed',
        subtitle: 'Something went wrong. Please try again.',
      },
      warning: {
        title: 'Warning',
        subtitle: 'Please review the following information.',
      },
      info: {
        title: 'Information',
        subtitle: '',
      },
      http403: {
        title: '403 — Access Denied',
        subtitle: 'You do not have permission to access this page.',
      },
      http404: {
        title: '404 — Page Not Found',
        subtitle: 'The page you are looking for does not exist.',
      },
      http500: {
        title: '500 — Server Error',
        subtitle: 'An unexpected error occurred on the server.',
      },
    },
    empty: {
      noData: {
        description: 'No data yet',
      },
      noResult: {
        description: 'No results found',
      },
      error: {
        description: 'Failed to load data',
      },
      noPermission: {
        description: 'You do not have permission to view this',
      },
      retry: 'Retry',
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
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      retry: 'Retry',
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
