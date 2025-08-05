(({"document": doc, "location": loc,}, formCssSelector, tplItemCssClass) => doc.addEventListener("DOMContentLoaded", () => {
    const nodeForm = doc.querySelector(formCssSelector);
    const nodeFormInput = nodeForm.querySelector(nodeForm?.dataset.trigger);
    const nodeFormDialog = doc.querySelector(nodeForm?.dataset.dialog);
    const nodeFormDialogBodyTpl = nodeFormDialog.querySelector(nodeFormDialog?.dataset.target);
    const nodeFormAction = new URL(nodeForm?.getAttribute("action"), loc.origin);
    const nodeTrTpl = nodeForm.querySelector(nodeForm?.dataset.target);
    const tplItemCssSelector = `.${tplItemCssClass}`;
    const fNodeCloneParse = (nodeTpl, dataItem) => {
        const node = nodeTpl.content.cloneNode(true).firstElementChild;
        const fReplace = (match, p1) => p1 in dataItem ? dataItem[p1] : match;

        [
            ["*[data-content]", nodeItem => nodeItem.textContent = dataItem[nodeItem.dataset.content],]
            , ["*", nodeItem => Object
                .entries(nodeItem.attributes)
                .map(([,{"name": attrName, "value": attrValue,},]) => [attrName, attrValue,])
                .filter(([attrName,]) => !attrName.startsWith("data-"))
                .map(([attrName, attrValue,]) => [attrName, attrValue.replace(/\{(.+?)\}/ug, fReplace),])
                .forEach(([attrName, attrValue,]) => nodeItem.setAttribute(attrName, attrValue))
            ,]
            ,
        ].forEach(([cssSelector, sub,]) => node.querySelectorAll(cssSelector).forEach(sub));

        node.classList.add(tplItemCssClass);
        node.dataset.data = JSON.stringify(dataItem);
        nodeTpl.after(node);

        return node;
    };
    const fNodeCloneRemove = ({"parentNode": parent,}) =>
        parent.querySelectorAll(tplItemCssSelector).forEach(node => node.remove());

    const fNodeFormEnable = bool => {
        const isPending = "pending" in nodeForm.dataset;

        if ((!bool && isPending) || (bool && !isPending)) return false;
        if (bool) delete nodeForm.dataset.pending;
        else nodeForm.dataset.pending = true;

        [... nodeForm.elements].forEach(node => node.disabled = !bool);

        if (bool) nodeFormInput.focus();

        return true;
    };

    const fFormActionData = (url, success, done) => 
        fetch(url)
            .then(data => data.json())
            .then(({"data": data, "data": {"length": len,},}) => {if (!len) throw data; return data;})
            .then(data => data.reverse())
            .then(data => data.forEach(success))
            .catch(exception => console.log(exception))
            .finally(done);

    const fFormAction = evt => {
        evt?.preventDefault();

        nodeFormAction.search = new URLSearchParams(new FormData(nodeForm));

        if (!fNodeFormEnable(false)) return;

        [
            [fNodeCloneRemove, nodeTrTpl,]
            , [
                fFormActionData
                , nodeFormAction
                , dataItem => fNodeCloneParse(nodeTrTpl, dataItem)
                , () => fNodeFormEnable(true)
                ,
            ]
        ].forEach(([sub, ... args]) => sub(... args));
    };

    nodeTrTpl.parentNode.addEventListener("click", evt => {
        const node = evt.target.closest(tplItemCssSelector);

        if (!node) return;

        [[fNodeCloneRemove,], [fNodeCloneParse, JSON.parse(node.dataset.data),],]
            .forEach(([sub, ... args]) => sub(nodeFormDialogBodyTpl, ... args));

        nodeFormDialog.showModal();
        evt.preventDefault();
    });

    [["input", nodeFormInput,], ["submit", nodeForm,],]
        .forEach(([evtName, node,]) => nodeForm.addEventListener(evtName, fFormAction));

    [["click", () => nodeFormDialog.close(),],]
        .forEach(([evtName, sub,]) => {
            nodeFormDialog
                .querySelectorAll(nodeFormDialog?.dataset.close)
                .forEach(node => node.addEventListener(evtName, sub));

            nodeFormDialog
                .addEventListener(evtName, evt => [evt.target,].filter(node => node === nodeFormDialog).forEach(sub));
        });

    fFormAction();
}))(window, ".form-users", "clone");