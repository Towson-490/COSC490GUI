// Create generalized alert element
const actionAlert = (id, type, message) => {
    return $(`
    <div id=${id} class="alert show fade alert-${type}" role="alert">
        ${message}
    </div>
    `);
};

const replaceAlert = (id, type, message) => {
    $(`#${id}`).replaceWith(actionAlert(id, type, message));
};

const closeAlert = (id, timeout) => {
    setTimeout(function() {
        $(`#${id}`).alert('close');
    }, timeout);
}; 