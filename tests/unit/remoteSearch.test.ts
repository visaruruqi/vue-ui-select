// ============================================================
// Pins the README "Remote search" example. The code below is that example
// verbatim, so the documented pattern cannot rot without a test failing.
// ============================================================
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import UiSelect from '../../src/components/UiSelect.vue'
import UiSelectMatch from '../../src/components/UiSelectMatch.vue'
import UiSelectChoices from '../../src/components/UiSelectChoices.vue'
import UiSelectNoChoice from '../../src/components/UiSelectNoChoice.vue'

const ALL = [
  { id: 1, name: 'Hilton Worldwide' },
  { id: 2, name: 'Hilton Garden Inn' },
  { id: 3, name: 'Marriott' },
]

// Stands in for the API. Its answers must render exactly as returned — object
// items with no search-fields are never re-filtered client-side.
const api = {
  searchCompanies: vi.fn(async (term: string) => ({
    data: ALL.filter((c) => c.name.toLowerCase().includes(term.toLowerCase())),
  })),
}

// ---- verbatim from the README ----
const MIN_SEARCH_LENGTH = 2

function buildExample() {
  const company = ref<any>(null)
  const companies = ref<any[]>([])
  const searching = ref(false)
  let latestSearchId = 0

  async function onSearch(term: string) {
    if (!term || term.length < MIN_SEARCH_LENGTH) {
      companies.value = []
      return
    }
    const searchId = ++latestSearchId
    searching.value = true
    try {
      const { data } = await api.searchCompanies(term)
      if (searchId !== latestSearchId) return
      companies.value = data ?? []
    } catch {
      if (searchId !== latestSearchId) return
      companies.value = []
    } finally {
      if (searchId === latestSearchId) searching.value = false
    }
  }

  const wrapper = mount(
    defineComponent({
      setup: () => ({ company, companies, searching, onSearch }),
      render() {
        return h(
          UiSelect,
          {
            modelValue: this.company,
            'onUpdate:modelValue': (v: any) => { company.value = v },
            searchEnabled: true,
            debounce: 300,
            loading: this.searching,
            onSearch: this.onSearch,
          },
          {
            default: () => [
              h(UiSelectMatch, { placeholder: 'Search by company name or code' }),
              h(UiSelectChoices, {
                items: this.companies,
                trackBy: 'id',
                minimumInputLength: MIN_SEARCH_LENGTH,
              }, { choice: ({ item }: any) => item?.name }),
              h(UiSelectNoChoice, {}, { default: () => 'No companies found' }),
            ],
          },
        )
      },
    }),
    { attachTo: document.body },
  )

  return { wrapper, companies, searching }
}

afterEach(() => {
  vi.useRealTimers()
  api.searchCompanies.mockClear()
})

describe('README remote-search example', () => {
  it('debounces to one request and renders the API rows', async () => {
    vi.useFakeTimers()
    const { wrapper } = buildExample()

    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    const input = wrapper.find('input.ui-select__input')

    for (const term of ['h', 'hi', 'hil']) {
      await input.setValue(term)
      vi.advanceTimersByTime(20)
      await nextTick()
    }
    expect(api.searchCompanies).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    await vi.runAllTimersAsync()
    await nextTick()

    expect(api.searchCompanies).toHaveBeenCalledTimes(1)
    expect(api.searchCompanies).toHaveBeenCalledWith('hil')
    expect(wrapper.findAll('[data-ui-select-choice-index]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Hilton Worldwide')

    wrapper.unmount()
  })

  it('below minimum-input-length nothing is requested', async () => {
    vi.useFakeTimers()
    const { wrapper, companies } = buildExample()

    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    await wrapper.find('input.ui-select__input').setValue('h')
    vi.advanceTimersByTime(1000)
    await vi.runAllTimersAsync()
    await nextTick()

    expect(api.searchCompanies).not.toHaveBeenCalled()
    expect(companies.value).toEqual([])
    wrapper.unmount()
  })

  it('server rows the term does not contain still render — no filter-fn needed', async () => {
    vi.useFakeTimers()
    const { wrapper, companies } = buildExample()

    await wrapper.find('.ui-select-match').trigger('click')
    await nextTick()
    await wrapper.find('input.ui-select__input').setValue('hil')
    vi.advanceTimersByTime(300)
    await vi.runAllTimersAsync()
    await nextTick()

    // Server answers with a row that does NOT contain "hil" — as a real fuzzy
    // or code-based backend would. It must still render.
    companies.value = [{ id: 9, name: 'Marriott' }]
    await nextTick()

    expect(wrapper.text()).toContain('Marriott')
    wrapper.unmount()
  })
})
