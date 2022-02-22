import { createPart } from '../util/index.js'
import { RESTROOM_FETCH_DISTANCE } from '../config.js'

export function setRestroomAmountElement(target, amount) {
    
    const container = document.createElement('div')
    container.className = 'restroom-amount-container'

    if (amount < 1) {
        return
    }

    if (amount > 1) {
        container.appendChild(createPart({ text: `${amount} käymälää ${RESTROOM_FETCH_DISTANCE/1000} km säteellä.` }))
    } else if (amount === 1) {
        container.appendChild(createPart({ text: `${amount} käymälä ${RESTROOM_FETCH_DISTANCE/1000} km säteellä.` }))
    }

    target.appendChild(container)
}