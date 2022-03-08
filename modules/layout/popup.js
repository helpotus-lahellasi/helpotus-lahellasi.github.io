function killPopup({ target, id }) {
    const popupInTarget = target.querySelector('#' + id)
    if (!popupInTarget) return
    popupInTarget.classList.add('popup-hide')
    setTimeout(() => target.removeChild(popupInTarget), 2000)
}

export function summonPopup({ heading, text, infinite, time, target, onAccept, onCancel, acceptText, cancelText }) {
    const id = 'popup-' + Math.round(Math.random() * 10000)
    let killed = false

    const popup = document.createElement('div')
    popup.className = 'popup'
    popup.id = id

    const header = document.createElement('header')

    if (heading) {
        const h3 = document.createElement('h3')
        h3.textContent = heading
        header.appendChild(h3)
    }

    const closeButton = document.createElement('button')
    closeButton.textContent = 'x'
    closeButton.className = 'close'
    closeButton.addEventListener('click', () => {
        if (killed) return
        killed = true
        killPopup({ id, target })
    })
    header.appendChild(closeButton)

    popup.appendChild(header)

    if (text) {
        const p = document.createElement('p')
        p.textContent = text
        popup.appendChild(p)
    }

    const footer = document.createElement('footer')

    const accept = document.createElement('button')
    accept.textContent = acceptText || 'ok'
    accept.className = 'accept'
    accept.addEventListener('click', () => {
        if (killed) return
        if (onAccept) onAccept()
        killed = true
        killPopup({ id, target })
    })
    footer.appendChild(accept)

    const cancel = document.createElement('button')
    cancel.textContent = cancelText || 'kumoa'
    cancel.className = 'cancel'
    cancel.addEventListener('click', () => {
        if (killed) return
        if (onCancel) onCancel()
        killed = true
        killPopup({ id, target })
    })
    footer.appendChild(cancel)

    popup.appendChild(footer)

    target.appendChild(popup)

    if (!infinite) {
        setTimeout(() => {
            if (!killed) {
                killed = true
                killPopup({ id, target })
            }
        }, time || 5000)
    }

    return popup
}
