import { createPart } from '../util/index'
import { RESTROOM_FETCH_DISTANCE } from '../config'

/**
 * Write into html element how many toilets are displayed in selected area
 */
export function setRestroomAmountElement(target: HTMLElement, amount: number): void {
    const container = document.createElement('div')
    container.className = 'restroom-amount-container'

    if (amount < 1) {
        return
    }

    if (amount > 1) {
        container.appendChild(createPart({ text: `${amount} käymälää ${RESTROOM_FETCH_DISTANCE / 1000} km säteellä.` }))
    } else if (amount === 1) {
        container.appendChild(createPart({ text: `${amount} käymälä ${RESTROOM_FETCH_DISTANCE / 1000} km säteellä.` }))
    }

    target.appendChild(container)
}
