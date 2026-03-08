<script lang="ts">
import { defineComponent, inject, onMounted, useSlots } from 'vue'
import { UI_SELECT_CONTEXT } from '../symbols'
import type { UiSelectContext } from '../types'

export default defineComponent({
  name: 'UiSelectNoChoice',
  setup() {
    const ctx = inject(UI_SELECT_CONTEXT) as UiSelectContext
    const slots = useSlots()

    // Register slot render function with context for UiSelectChoices to consume
    const renderFn = () => {
      return slots.default ? slots.default() : null
    }

    ctx.registerNoChoiceContent(renderFn)

    // This component renders nothing — its content is rendered by UiSelectChoices
    return () => null
  },
})
</script>
