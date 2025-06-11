export function deFormatNumber(value) {
    value = value.replace(/[^\d\.]/g, '')
    // Remove extra dots after the first one
    const firstDot = value.indexOf('.')
    if (firstDot !== -1) {
        value =
            value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '')
    }

    let [intPart, decPart] = value.split('.')
    intPart = intPart.replace(/^0+(?=\d)/, '')
    if (intPart === '') intPart = '0'
    value = decPart !== undefined ? `${intPart}.${decPart}` : intPart

    return value
}

export function formatNumber(value) {
    value = String(value)
    value = value.replace(/[^\d\.]/g, '')
    // Remove extra dots after the first one
    const firstDot = value.indexOf('.')
    if (firstDot !== -1) {
        value =
            value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '')
    }
    const endWithDot = value.endsWith('.')
    if (endWithDot) {
        value = value.slice(0, -1)
    }
    let [intPart, decPart] = value.split('.')
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    intPart = intPart.replace(/^0+(?=\d)/, '')
    if (intPart === '') intPart = '0'
    value = decPart !== undefined ? `${intPart}.${decPart}` : intPart
    if (endWithDot) {
        value = value + '.'
    }

    return value
}
