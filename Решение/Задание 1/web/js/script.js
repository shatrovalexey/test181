(({"document": doc, "location": loc,}, formCssSelector) => doc.addEventListener("DOMContentLoaded", () => {
    const nodeForm = doc.querySelector(formCssSelector);
    const nodeFormInput = nodeForm.querySelector(nodeForm?.dataset.trigger);
    const nodeFormDialog = doc.querySelector(nodeForm?.dataset.dialog);
    const nodeFormDialogBodyTpl = nodeFormDialog.querySelector(nodeFormDialog?.dataset.target);
    const nodeFormAction = new URL(nodeForm?.getAttribute("action"), loc.origin);
    const nodeTrTpl = nodeForm.querySelector(nodeForm?.dataset.target);
    const fNodeCloneParse = (nodeTpl, dataItem) => {
        const node = nodeTpl.content.cloneNode(true).firstElementChild;

        [
            ["*[data-content]", nodeItem => nodeItem.textContent = dataItem[nodeItem.dataset.content],]
            , ["*", nodeItem => Object.entries(nodeItem.attributes)
                .forEach(([,{"name": attrName, "value": attrValue,},]) => nodeItem.setAttribute(
                    attrName, attrValue.replace(/\{(.+?)\}/ug, (match, p1) => dataItem[p1])
                ))
            ,]
            ,
        ].forEach(([cssSelector, sub,]) => node.querySelectorAll(cssSelector).forEach(sub));

        node.classList.add("clone");
        nodeTpl.after(node);

        return node;
    };
    const fNodeCloneRemove = ({"parentNode": parent,}, cssSelector = ".clone") =>
        parent.querySelectorAll(cssSelector).forEach(node => node.remove());

    const fNodeFormEnable = bool => {
        const isPending = "pending" in nodeForm.dataset;

        if ((!bool && isPending) || (bool && !isPending)) return false;
        if (bool) delete nodeForm.dataset.pending;
        else nodeForm.dataset.pending = true;

        [... nodeForm.elements]
            .filter(node => node !== nodeFormInput)
            .forEach(node => node.disabled = !bool);

        return true;
    };

    const fFormAction = evt => {
        evt?.preventDefault();

        if (!fNodeFormEnable(false)) return false;

        fNodeCloneRemove(nodeTrTpl);

        nodeFormAction.search = new URLSearchParams(new FormData(nodeForm));

        fetch(nodeFormAction)
            .then(data => data.json())
            .then(({"data": data, "data": {"length": len,},}) => {if (!len) throw data; return data;})
            .then(data => data.reverse())
            .then(data => data.forEach(dataItem => fNodeCloneParse(nodeTrTpl, dataItem)
                .addEventListener("click", evt => {
                    evt.preventDefault();

                    [[fNodeCloneRemove,], [fNodeCloneParse, dataItem,],]
                        .forEach(([sub, ... args]) => sub(nodeFormDialogBodyTpl, ... args));

                    nodeFormDialog.showModal();
                })
            ))
            .catch(exception => console.log(exception))
            .finally(() => fNodeFormEnable(true));
    };

	[["submit", nodeFormInput,], ["input", nodeForm,],]
		.forEach(([evtName, node,]) => node.addEventListener(evtName, fFormAction));

    [["click", () => nodeFormDialog.close(),],]
        .forEach(([evtName, sub,]) => {
            nodeFormDialog
                .querySelectorAll(nodeFormDialog?.dataset.close)
                .forEach(node => node.addEventListener(evtName, sub));

            nodeFormDialog
                .addEventListener(evtName, evt => [evt.target,].filter(node => node === nodeFormDialog).forEach(sub));
        });

    fFormAction();
}))(window, ".form-users");