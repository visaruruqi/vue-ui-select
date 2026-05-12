<template>
  <div data-testid="page-form-validation">
    <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Form Validation</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      <code>&lt;ui-select&gt;</code> participates in any DOM-event-based validator (oop-validator,
      VeeValidate, hand-rolled, …) without coupling. This page demonstrates the
      <code>oop-validator</code> directives (<code>v-required</code>) attached directly to the
      component — exactly like AngularJS' <code>ng-required</code>. <code>v-minlength</code>
      on the native name field uses string length; for multi-select arrays, use
      <code>v-required</code> alone or write a custom rule (oop-validator's built-in
      minlength rule is string-only).
    </p>

    <div class="max-w-2xl space-y-6">
      <ExampleSection title="Registration form" :code="code">
        <form
          name="registration"
          v-submit="handleSubmit"
          class="space-y-4"
          data-testid="registration-form"
        >
          <!-- Full name (native input — proves identical behavior) -->
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full name <span class="text-red-600">*</span>
            </label>
            <input
              name="fullName"
              type="text"
              v-model="formData.fullName"
              v-required
              v-minlength="2"
              placeholder="Jane Smith"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 v-touched.v-invalid:border-red-500"
              data-testid="full-name-input"
            />
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="form.fields.value?.fullName?.$touched || form.$submitted.value"
              v-messages="form.fields.value?.fullName?.$error ?? {}"
            >
              <span v-message="'required'">Full name is required.</span>
              <span v-message="'minlength'">Must be at least 2 characters.</span>
            </div>
          </div>

          <!-- Country (single-select ui-select) -->
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country <span class="text-red-600">*</span>
            </label>
            <ui-select
              name="countryId"
              v-model="formData.countryId"
              v-required
              :clearable="true"
              data-testid="country-select"
            >
              <ui-select-match placeholder="Select a country...">
                <template #default="{ selected }">
                  {{ selected?.name }}
                </template>
              </ui-select-match>
              <ui-select-choices :items="countries" :track-by="'id'" :bind-property="'id'" :search-fields="['name']">
                <template #choice="{ item }">
                  <div class="flex justify-between items-center">
                    <span>{{ item.name }}</span>
                    <small class="text-gray-400">{{ item.code }}</small>
                  </div>
                </template>
              </ui-select-choices>
            </ui-select>
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="form.fields.value?.countryId?.$touched || form.$submitted.value"
              v-messages="form.fields.value?.countryId?.$error ?? {}"
            >
              <span v-message="'required'">Please pick a country.</span>
            </div>
          </div>

          <!-- Languages (multi-select ui-select) -->
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Languages <span class="text-red-600">*</span>
            </label>
            <ui-select
              name="languages"
              v-model="formData.languages"
              v-required
              :multiple="true"
              :clearable="true"
              data-testid="languages-select"
            >
              <ui-select-match placeholder="Pick languages...">
                <template #tag="{ item, removeItem }">
                  <span class="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 rounded px-2 py-0.5 text-sm mr-1">
                    {{ item.name }}
                    <button type="button" @click="removeItem(item)" class="hover:text-indigo-600">&times;</button>
                  </span>
                </template>
              </ui-select-match>
              <ui-select-choices :items="languages" :track-by="'id'" :search-fields="['name']">
                <template #choice="{ item }">{{ item.name }}</template>
              </ui-select-choices>
            </ui-select>
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="form.fields.value?.languages?.$touched || form.$submitted.value"
              v-messages="form.fields.value?.languages?.$error ?? {}"
            >
              <span v-message="'required'">Pick at least one language.</span>
            </div>
          </div>

          <!-- Account type (search-disabled ui-select) -->
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account type <span class="text-red-600">*</span>
            </label>
            <ui-select
              name="accountType"
              v-model="formData.accountType"
              v-required
              :search-enabled="false"
              data-testid="account-type-select"
            >
              <ui-select-match placeholder="Select type...">
                <template #default="{ selected }">{{ selected?.label ?? '' }}</template>
              </ui-select-match>
              <ui-select-choices :items="accountTypes" :track-by="'value'">
                <template #choice="{ item }">{{ item.label }}</template>
              </ui-select-choices>
            </ui-select>
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="form.fields.value?.accountType?.$touched || form.$submitted.value"
              v-messages="form.fields.value?.accountType?.$error ?? {}"
            >
              <span v-message="'required'">Account type is required.</span>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="rounded bg-indigo-600 text-white text-sm font-semibold px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
              data-testid="submit-button"
            >
              Submit
            </button>
            <button
              type="button"
              class="rounded border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50"
              @click="form.$reset()"
              data-testid="reset-button"
            >
              Reset
            </button>
          </div>

          <p v-if="successMessage" class="text-green-600 text-sm mt-2" data-testid="success-message">
            {{ successMessage }}
          </p>
        </form>
      </ExampleSection>

      <ExampleSection title="Custom rule: minimum N selections" :code="customRuleCode">
        <p class="text-xs text-gray-500 mb-4">
          oop-validator's built-in <code>v-minlength</code> rule only works on strings. For
          "pick at least N items" on a multi-select, we register a custom rule that implements
          <code>IValidationRule</code>. The directive contract is the same — classes still flip
          on the <code>&lt;ui-select&gt;</code> host, error messages still show via <code>v-messages</code>.
        </p>

        <form
          name="customRuleForm"
          v-submit="handleCustomSubmit"
          class="space-y-4"
          data-testid="custom-rule-form"
        >
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Languages <span class="text-red-600">*</span>
              <span class="text-xs text-gray-500">(pick at least 2)</span>
            </label>
            <ui-select
              name="languages"
              v-model="customFormData.languages"
              v-required
              :multiple="true"
              :clearable="true"
              data-testid="custom-languages-select"
            >
              <ui-select-match placeholder="Pick languages...">
                <template #tag="{ item, removeItem }">
                  <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 rounded px-2 py-0.5 text-sm mr-1">
                    {{ item.name }}
                    <button type="button" @click="removeItem(item)" class="hover:text-emerald-600">&times;</button>
                  </span>
                </template>
              </ui-select-match>
              <ui-select-choices :items="languages" :track-by="'id'" :search-fields="['name']">
                <template #choice="{ item }">{{ item.name }}</template>
              </ui-select-choices>
            </ui-select>
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="customForm.fields.value?.languages?.$touched || customForm.$submitted.value"
              v-messages="customForm.fields.value?.languages?.$error ?? {}"
            >
              <!-- Same message text for both rules — user-facing requirement is
                   'pick at least 2', so we report it consistently regardless of
                   which rule (required → 0 items, or minSelections → 1 item) is
                   currently failing. -->
              <span v-message="'required'">Pick at least 2 languages.</span>
              <span v-message="'minSelections'">Pick at least 2 languages.</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              <span class="font-semibold">Rules on this field:</span>
              <code>v-required</code> + custom <code>MinSelectionsRule(2)</code> registered via
              <code>form.registerRule('languages', 'minSelections', rule)</code>.
            </p>
          </div>

          <!-- Email: native input + v-required + v-type. Shows the form mixes
               native inputs with ui-select, and that minSelections does NOT
               apply here (it was registered against 'languages' only). -->
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span class="text-red-600">*</span>
            </label>
            <input
              name="email"
              type="email"
              v-model="customFormData.email"
              v-required
              v-type
              placeholder="jane@example.com"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              data-testid="custom-email-input"
            />
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="customForm.fields.value?.email?.$touched || customForm.$submitted.value"
              v-messages="customForm.fields.value?.email?.$error ?? {}"
            >
              <span v-message="'required'">Email is required.</span>
              <span v-message="'type'">Enter a valid email address.</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              <span class="font-semibold">Rules on this field:</span>
              <code>v-required</code> + <code>v-type</code> (built-in). No
              <code>minSelections</code> — that rule is scoped to <code>languages</code> only.
            </p>
          </div>

          <!-- Country: single-select with v-required ONLY. Demonstrates that
               the custom MinSelectionsRule registered against `languages` does
               NOT apply here. Each rule registration is per-field. -->
          <div class="field-group">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country <span class="text-red-600">*</span>
            </label>
            <ui-select
              name="countryId"
              v-model="customFormData.countryId"
              v-required
              :clearable="true"
              data-testid="custom-country-select"
            >
              <ui-select-match placeholder="Select a country...">
                <template #default="{ selected }">{{ selected?.name }}</template>
              </ui-select-match>
              <ui-select-choices :items="countries" :track-by="'id'" :bind-property="'id'" :search-fields="['name']">
                <template #choice="{ item }">
                  <div class="flex justify-between items-center">
                    <span>{{ item.name }}</span>
                    <small class="text-gray-400">{{ item.code }}</small>
                  </div>
                </template>
              </ui-select-choices>
            </ui-select>
            <div
              class="error-list text-red-600 text-xs mt-1"
              v-show="customForm.fields.value?.countryId?.$touched || customForm.$submitted.value"
              v-messages="customForm.fields.value?.countryId?.$error ?? {}"
            >
              <span v-message="'required'">Please pick a country.</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              <span class="font-semibold">Rules on this field:</span>
              <code>v-required</code> only. Same form as Languages above, but the
              custom rule was scoped to <code>'languages'</code> — it does not bleed here.
            </p>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="rounded bg-emerald-600 text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-700"
              data-testid="custom-submit-button"
            >
              Submit
            </button>
            <button
              type="button"
              class="rounded border border-gray-300 text-gray-700 text-sm px-4 py-2 hover:bg-gray-50"
              @click="customForm.$reset()"
            >
              Reset
            </button>
          </div>

          <p v-if="customSuccessMessage" class="text-green-600 text-sm mt-2" data-testid="custom-success-message">
            {{ customSuccessMessage }}
          </p>
        </form>
      </ExampleSection>

      <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 mt-2">
        <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Live validator state</h3>
        <p class="text-xs text-gray-500 mb-3">
          Classes are toggled on the <code>&lt;ui-select&gt;</code> host element by
          oop-validator's directives — the same way <code>ng-invalid</code> / <code>ng-touched</code>
          worked in AngularJS. Inspect any field above and you'll see <code>v-touched</code>,
          <code>v-invalid</code>, <code>v-invalid-required</code>, etc. appear on the root.
        </p>
        <dl class="text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <dt class="font-semibold text-gray-700">form.$valid</dt>
            <dd data-testid="form-valid">{{ form.$valid.value }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-700">form.$dirty</dt>
            <dd>{{ form.$dirty.value }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-700">form.$submitted</dt>
            <dd>{{ form.$submitted.value }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="font-semibold text-gray-700">model</dt>
            <dd class="break-all"><pre class="text-xs whitespace-pre-wrap">{{ JSON.stringify(formData, null, 2) }}</pre></dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useForm } from 'oop-validator/vue'
import { IValidationRule } from 'oop-validator'
import ExampleSection from '../components/ExampleSection.vue'

/**
 * Custom rule: passes when value is an array with at least N elements.
 * The built-in MinValidationRule is string-only — this fills the gap for
 * multi-select fields. Drop into any oop-validator form via:
 *   form.registerRule('languages', 'minSelections', new MinSelectionsRule(2))
 */
class MinSelectionsRule extends IValidationRule {
  private min = 1
  private msg = ''

  constructor(min = 1) {
    super()
    this.min = min
  }

  isValid(value: unknown): [boolean, string] {
    // Treat null/undefined as zero items (empty selection), not "absent".
    const arr = value == null ? [] : value
    if (!Array.isArray(arr)) {
      return [false, this.msg || 'Value must be a list.']
    }
    const ok = arr.length >= this.min
    return [ok, ok ? '' : (this.msg || `Pick at least ${this.min}.`)]
  }

  isMatch(type: string): boolean {
    return type.toLowerCase() === 'minselections'
  }

  setParams(params: { length?: number } | undefined): void {
    if (params && typeof params.length === 'number' && params.length >= 0) {
      this.min = params.length
    }
  }

  setErrorMessage(message: string): void {
    this.msg = message
  }
}

const countries = [
  { id: 'us', name: 'United States', code: 'US' },
  { id: 'uk', name: 'United Kingdom', code: 'UK' },
  { id: 'de', name: 'Germany', code: 'DE' },
  { id: 'fr', name: 'France', code: 'FR' },
  { id: 'jp', name: 'Japan', code: 'JP' },
]

const languages = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'de', name: 'German' },
  { id: 'ja', name: 'Japanese' },
  { id: 'zh', name: 'Chinese' },
]

const accountTypes = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'enterprise', label: 'Enterprise' },
]

const formData = reactive({
  fullName: '',
  countryId: null as string | null,
  languages: [] as Array<{ id: string; name: string }>,
  accountType: null as { value: string; label: string } | null,
})

const form = useForm('registration', formData)
const successMessage = ref('')

function handleSubmit() {
  successMessage.value = 'Submitted! (this is a demo — nothing was sent)'
  setTimeout(() => { successMessage.value = '' }, 4000)
}

// ─── Custom-rule example: "pick at least 2 languages" ─────────────────────
const customFormData = reactive({
  languages: [] as Array<{ id: string; name: string }>,
  email: '',
  countryId: null as string | null,
})
const customForm = useForm('customRuleForm', customFormData)
const minTwo = new MinSelectionsRule(2)
minTwo.setErrorMessage('Pick at least 2 languages.')
customForm.registerRule('languages', 'minSelections', minTwo)

const customSuccessMessage = ref('')
function handleCustomSubmit() {
  customSuccessMessage.value = 'Submitted with custom rule!'
  setTimeout(() => { customSuccessMessage.value = '' }, 4000)
}

const customRuleCode = `// 1. Define a rule by extending IValidationRule
import { IValidationRule } from 'oop-validator'

class MinSelectionsRule extends IValidationRule {
  private min = 1
  private msg = ''

  constructor(min = 1) { super(); this.min = min }

  isValid(value: unknown): [boolean, string] {
    // null/undefined treated as zero items so the rule fires on empty state
    const arr = value == null ? [] : value
    if (!Array.isArray(arr)) return [false, 'Value must be a list.']
    const ok = arr.length >= this.min
    return [ok, ok ? '' : (this.msg || \`Pick at least \${this.min}.\`)]
  }
  isMatch(type: string) { return type.toLowerCase() === 'minselections' }
  setParams(params: { length?: number }) {
    if (params?.length != null) this.min = params.length
  }
  setErrorMessage(message: string) { this.msg = message }
}

// 2. Register against the field — the third arg becomes the rule key.
//    The directive contract stays the same: v-invalid-minSelections on the host,
//    v-message="'minSelections'" picks up the error text.
const form = useForm('customRuleForm', formData)
const rule = new MinSelectionsRule(2)
rule.setErrorMessage('Pick at least 2 languages.')
form.registerRule('languages', 'minSelections', rule)

// 3. Use it in the template — pair v-required (anchors the directive's field
//    controller so classes/listeners attach) with the registered custom rule.
//    Use the same message text for both so the user sees one consistent string
//    regardless of which rule is currently failing.
<template>
  <form name="customRuleForm" v-submit="handleSubmit">
    <ui-select name="languages" v-model="formData.languages" v-required :multiple="true">…</ui-select>
    <div v-show="form.fields.value?.languages?.$touched"
         v-messages="form.fields.value?.languages?.$error ?? {}">
      <span v-message="'required'">Pick at least 2 languages.</span>
      <span v-message="'minSelections'">Pick at least 2 languages.</span>
    </div>
  </form>
</template>`

const code = `<template>
  <form name="registration" v-submit="handleSubmit">
    <input name="fullName" v-model="formData.fullName" v-required v-minlength="2" />

    <ui-select name="countryId" v-model="formData.countryId" v-required>
      <ui-select-match placeholder="Select a country...">
        <template #default="{ selected }">{{ selected?.name }}</template>
      </ui-select-match>
      <ui-select-choices
        :items="countries"
        track-by="id"
        bind-property="id"
        :search-fields="['name']"
      >…</ui-select-choices>
    </ui-select>

    <ui-select name="languages" v-model="formData.languages" v-required :multiple="true">…</ui-select>

    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { useForm } from 'oop-validator/vue'

const formData = reactive({ fullName: '', countryId: null, languages: [] })
const form = useForm('registration', formData)

function handleSubmit() {
  // form.$valid is guaranteed true here
}
<\/script>`
</script>

