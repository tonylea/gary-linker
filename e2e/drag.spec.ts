import { test, expect, Page } from '@playwright/test'

// dnd-kit's PointerSensor needs a real press, a move past its 5px activation
// distance, stepped intermediate moves so collision detection fires over each
// droppable, then a release. page.dragAndDrop fires HTML5 drag events, which
// dnd-kit ignores — so we drive the mouse manually.
async function dragHandleToTarget(
  page: Page,
  handleTestId: string,
  targetTestId: string,
  drop: 'center' | 'top' = 'center'
) {
  const handle = page.getByTestId(handleTestId)
  const target = page.getByTestId(targetTestId)
  await handle.scrollIntoViewIfNeeded()

  const h = await handle.boundingBox()
  const t = await target.boundingBox()
  if (!h || !t) throw new Error(`missing bounding box for ${handleTestId} or ${targetTestId}`)

  const start = { x: h.x + h.width / 2, y: h.y + h.height / 2 }
  const end = { x: t.x + t.width / 2, y: drop === 'top' ? t.y + 8 : t.y + t.height / 2 }

  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + 8, start.y + 8, { steps: 5 })
  await page.mouse.move(end.x, end.y, { steps: 20 })
  await page.mouse.move(end.x, end.y + 2, { steps: 3 })
  await page.mouse.up()
}

function linkOrder(page: Page, groupTestId: string) {
  return page
    .getByTestId(groupTestId)
    .locator('[data-testid^="link-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
}

function groupOrder(page: Page) {
  return page
    .locator('main [data-testid^="group-"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')))
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('link-gh')).toBeVisible()
})

test('reorders a link within its group', async ({ page }) => {
  expect(await linkOrder(page, 'group-dev')).toEqual([
    'link-gh',
    'link-mdn',
    'link-vite',
    'link-tw',
  ])

  await dragHandleToTarget(page, 'drag-link-gh', 'link-tw')

  const order = await linkOrder(page, 'group-dev')
  expect(order).toHaveLength(4)
  expect(order[0]).not.toBe('link-gh')
  expect(order).toContain('link-gh')
})

test('moves a link across groups', async ({ page }) => {
  await dragHandleToTarget(page, 'drag-link-gh', 'link-notion')

  expect(await linkOrder(page, 'group-dev')).not.toContain('link-gh')

  const toolsOrder = await linkOrder(page, 'group-tools')
  expect(toolsOrder).toContain('link-gh')
  expect(toolsOrder).toHaveLength(5)
})

test('reorders groups', async ({ page }) => {
  expect(await groupOrder(page)).toEqual(['group-dev', 'group-tools'])

  await dragHandleToTarget(page, 'drag-group-dev', 'group-tools')

  expect(await groupOrder(page)).toEqual(['group-tools', 'group-dev'])
})
