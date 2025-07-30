(({"document": doc, "location": loc,}, formCssSelector) => doc.addEventListener("DOMContentLoaded", () => {
    const nodeForm = doc.querySelector(formCssSelector);
    const nodeFormInput = nodeForm.querySelector(nodeForm?.dataset.trigger);
    const nodeFormDialog = doc.querySelector(nodeForm?.dataset.dialog);
    const nodeFormDialogBodyTpl = nodeFormDialog.querySelector(nodeFormDialog?.dataset.target);
    const nodeFormAction = new URL(nodeForm?.getAttribute("action"), loc.origin);
    const nodeTrTpl = nodeForm.querySelector(nodeForm?.dataset.target);
    const fNodeCloneParse = (nodeTpl, dataItem) => {
        const node = nodeTpl.content.cloneNode(true).firstElementChild;

        node.querySelectorAll("*[data-content]")
            .forEach(nodeItem => nodeItem.textContent = dataItem[nodeItem.dataset.content]);

        node.querySelectorAll("*")
            .forEach(nodeItem => {
                Object.entries(nodeItem.attributes)
                    .forEach(([,{"name": attrName, "value": attrValue,},]) => {
                        nodeItem.setAttribute(attrName, attrValue
                            .replace(/\{(.+?)\}/ug, (match, p1) => dataItem[p1]));
                    });
            });

        node.classList.add("clone");

        return node;
    };
    const fNodeCloneRemove = ({"parentNode": parent,}, cssSelector = ".clone") => parent
        .querySelectorAll(cssSelector).forEach(node => node.remove());

    const fFormAction = evt => {
        evt?.preventDefault();
        fNodeCloneRemove(nodeTrTpl);

        nodeFormAction.search = new URLSearchParams(new FormData(nodeForm));

        fetch(nodeFormAction)
            .then(data => data.json())
            .then(({"data": data,}) => {
                if (!data?.length) throw data;

                return data;
            })
            .then(data => data.reverse())
            .then(data => data.forEach(dataItem => {
                const nodeTr = fNodeCloneParse(nodeTrTpl, dataItem);

                nodeTr.firstElementChild.classList.add("clone");
                nodeTrTpl.after(nodeTr);

                nodeTr.addEventListener("click", evt => {
                    evt.preventDefault();

                    fNodeCloneRemove(nodeFormDialogBodyTpl);

                    const {"target": node,} = evt;
                    const nodeFormDialogBody = fNodeCloneParse(nodeFormDialogBodyTpl, dataItem);

                    nodeFormDialogBodyTpl.after(nodeFormDialogBody);
                    nodeFormDialog.showModal();
                });
            }))
            .catch(exception => {
                throw exception;
            });
    };

    nodeFormDialog
        .querySelectorAll(nodeFormDialog?.dataset.close)
        .forEach(node => {
            node.addEventListener("click", () => nodeFormDialog.close());
        });

    nodeFormDialog.addEventListener("click", ({"target": node,}) => {
        if (node === nodeFormDialog)
            nodeFormDialog.close();
    });

    nodeFormInput.addEventListener("input", fFormAction);

    fFormAction();
}))(window, ".form-users");