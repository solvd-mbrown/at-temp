export const generateObj = (user, treeId?) => ({
  identity: +user.id,
  properties: {
    myTreeIdByParent1: +treeId || +user.myTreeIdByParent1,
  },
});

export const reccCheck = (tree, result) => {
  if (!result?.length) {
    return;
  }

  expect(tree.length).toBeGreaterThanOrEqual(1);

  tree.forEach((item) => {
    expect(item.user).toBeDefined();

    const user = item.user;
    const married = item.married[0];
    expect(+user.identity).toBe(result[0].user.identity);
    expect(+user.properties.myTreeIdByParent1).toBe(
      result[0].user.properties.myTreeIdByParent1
    );
    if (married?.identity) {
      expect(+married.identity).toBe(result[0].married?.identity);
      expect(+married.properties.myTreeIdByParent1).toBe(
        result[0].married?.properties.myTreeIdByParent1
      );
    } else {
      expect(married?.identity).toBeFalsy();
      expect(married?.myTreeIdByParent1).toBeFalsy();
    }
  });

  result.shift();

  tree.forEach((item) => {
    reccCheck(item.descendant, result);
  });
};
