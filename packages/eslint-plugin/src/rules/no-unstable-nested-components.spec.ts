import dedent from "dedent";

import { allValid } from "../../test/common/valid";
import RuleTester, { getFixturesRootDir } from "../../test/rule-tester";
import rule, { RULE_NAME } from "./no-unstable-nested-components";

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: rootDir,
    },
});

ruleTester.run(RULE_NAME, rule, {
    valid: [
        ...allValid,
        dedent`
            function ParentComponent() {
              return (
                <div>
                  <OutsideDefinedFunctionComponent />
                </div>
              );
            }
        `,
        dedent`
            function ParentComponent() {
              return React.createElement(
                "div",
                null,
                React.createElement(OutsideDefinedFunctionComponent, null)
              );
            }
        `,
        dedent`
            function ParentComponent() {
              return (
                <SomeComponent
                  footer={<OutsideDefinedComponent />}
                  header={<div />}
                  />
              );
            }
        `,
        dedent`
            function ParentComponent() {
              return React.createElement(SomeComponent, {
                footer: React.createElement(OutsideDefinedComponent, null),
                header: React.createElement("div", null)
              });
            }
        `,
        dedent`
            function ParentComponent() {
              const MemoizedNestedComponent = React.useCallback(() => <div />, []);

              return (
                <div>
                  <MemoizedNestedComponent />
                </div>
              );
            }
        `,
        dedent`
            function ParentComponent() {
              const MemoizedNestedComponent = React.useCallback(
                () => React.createElement("div", null),
                []
              );

              return React.createElement(
                "div",
                null,
                React.createElement(MemoizedNestedComponent, null)
              );
            }
        `,
        dedent`
            function ParentComponent() {
              const MemoizedNestedFunctionComponent = React.useCallback(
                function () {
                  return <div />;
                },
                []
              );

              return (
                <div>
                  <MemoizedNestedFunctionComponent />
                </div>
              );
            }
        `,
        dedent`
            function ParentComponent() {
              const MemoizedNestedFunctionComponent = React.useCallback(
                function () {
                  return React.createElement("div", null);
                },
                []
              );

              return React.createElement(
                "div",
                null,
                React.createElement(MemoizedNestedFunctionComponent, null)
              );
            }
        `,
        dedent`
            function ParentComponent(props) {
              // Should not interfere handler declarations
              function onClick(event) {
                props.onClick(event.target.value);
              }

              const onKeyPress = () => null;

              function getOnHover() {
                return function onHover(event) {
                  props.onHover(event.target);
                }
              }

              return (
                <div>
                  <button
                    onClick={onClick}
                    onKeyPress={onKeyPress}
                    onHover={getOnHover()}

                    // These should not be considered as components
                    maybeComponentOrHandlerNull={() => null}
                    maybeComponentOrHandlerUndefined={() => undefined}
                    maybeComponentOrHandlerBlank={() => ''}
                    maybeComponentOrHandlerString={() => 'hello-world'}
                    maybeComponentOrHandlerNumber={() => 42}
                    maybeComponentOrHandlerArray={() => []}
                    maybeComponentOrHandlerObject={() => {}} />
                </div>
              );
            }
        `,
        dedent`
            function ParentComponent() {
              function getComponent() {
                return <div />;
              }

              return (
                <div>
                  {getComponent()}
                </div>
              );
            }
        `,
        dedent`
            function ParentComponent() {
              function getComponent() {
                return React.createElement("div", null);
              }

              return React.createElement("div", null, getComponent());
            }
        `,
        dedent`
            function ParentComponent() {
              return (
                <ComplexRenderPropComponent
                  listRenderer={data.map((items, index) => (
                    <ul>
                      {items[index].map((item) =>
                        <li>
                          {item}
                        </li>
                      )}
                    </ul>
                  ))
                  }
                />
              );
            }
        `,
        dedent`
            function ParentComponent() {
              return React.createElement(
                  RenderPropComponent,
                  null,
                  () => React.createElement("div", null)
              );
            }
        `,
        dedent`
            function ParentComponent(props) {
              return (
                <ul>
                  {props.items.map(item => (
                    <li key={item.id}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              );
            }
        `,
        dedent`
            function ParentComponent(props) {
              return (
                <List items={props.items.map(item => {
                  return (
                    <li key={item.id}>
                      {item.name}
                    </li>
                  );
                })}
                />
              );
            }
        `,
        dedent`
            function ParentComponent(props) {
              return React.createElement(
                "ul",
                null,
                props.items.map(() =>
                  React.createElement(
                    "li",
                    { key: item.id },
                    item.name
                  )
                )
              )
            }
        `,
        dedent`
            function ParentComponent(props) {
              return (
                <ul>
                  {props.items.map(function Item(item) {
                    return (
                      <li key={item.id}>
                        {item.name}
                      </li>
                    );
                  })}
                </ul>
              );
            }
        `,
        dedent`
            function ParentComponent(props) {
              return React.createElement(
                "ul",
                null,
                props.items.map(function Item() {
                  return React.createElement(
                    "li",
                    { key: item.id },
                    item.name
                  );
                })
              );
            }
        `,
        dedent`
            function createTestComponent(props) {
              return (
                <div />
              );
            }
        `,
        dedent`
            function createTestComponent(props) {
              return React.createElement("div", null);
            }
        `,
        dedent`
            function ParentComponent() {
              return (
                <SomeComponent>
                  {
                    thing.match({
                      renderLoading: () => <div />,
                      renderSuccess: () => <div />,
                      renderFailure: () => <div />,
                    })
                  }
                </SomeComponent>
              )
            }
        `,
        dedent`
            function ParentComponent() {
              const thingElement = thing.match({
                renderLoading: () => <div />,
                renderSuccess: () => <div />,
                renderFailure: () => <div />,
              });
              return (
                <SomeComponent>
                  {thingElement}
                </SomeComponent>
              )
            }
        `,
        dedent`
            function ParentComponent() {
              return (
                <ComponentForProps renderFooter={() => <div />} />
              );
            }
        `,
        dedent`
            function ParentComponent() {
              return React.createElement(ComponentForProps, {
                renderFooter: () => React.createElement("div", null)
              });
            }
        `,
        dedent`
            function ParentComponent() {
              useEffect(() => {
                return () => null;
              });

              return <div />;
            }
        `,
        dedent`
            function ParentComponent() {
              return (
                <SomeComponent renderers={{ Header: () => <div /> }} />
              )
            }
        `,
        dedent`
            function ParentComponent() {
              return (
                <SomeComponent renderMenu={() => (
                  <RenderPropComponent>
                    {items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </RenderPropComponent>
                )} />
              )
            }
        `,
        dedent`
            const ParentComponent = () => (
              <SomeComponent
                components={[
                  <ul>
                    {list.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>,
                ]}
              />
            );
        `,
        dedent`
            function ParentComponent() {
              const rows = [
                {
                  name: 'A',
                  render: (props) => <Row {...props} />
                },
              ];

              return <Table rows={rows} />;
            }
        `,
        dedent`
            function ParentComponent() {
              return <SomeComponent renderers={{ notComponent: () => null }} />;
            }
        `,
        dedent`
            const ParentComponent = createReactClass({
              displayName: "ParentComponent",
              statics: {
                getSnapshotBeforeUpdate: function () {
                  return null;
                },
              },
              render() {
                return <div />;
              },
            });
        `,
        dedent`
            function ParentComponent() {
              const _renderHeader = () => <div />;
              return <div>{_renderHeader()}</div>;
            }
        `,
        dedent`
            const testCases = {
              basic: {
                render() {
                  const Component = () => <div />;
                  return <div />;
                }
              }
            }
        `,
    ],
    invalid: [
        {
            code: dedent`
                function ParentComponent() {
                  function UnstableNestedFunctionComponent() {
                    return <div />;
                  }

                  return (
                    <div>
                      <UnstableNestedFunctionComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  function UnstableNestedFunctionComponent() {
                    return React.createElement("div", null);
                  }

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedFunctionComponent, null)
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const UnstableNestedVariableComponent = () => {
                    return <div />;
                  }

                  return (
                    <div>
                      <UnstableNestedVariableComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const UnstableNestedVariableComponent = () => {
                    return React.createElement("div", null);
                  }

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedVariableComponent, null)
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                const ParentComponent = () => {
                  function UnstableNestedFunctionComponent() {
                    return <div />;
                  }

                  return (
                    <div>
                      <UnstableNestedFunctionComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                const ParentComponent = () => {
                  function UnstableNestedFunctionComponent() {
                    return React.createElement("div", null);
                  }

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedFunctionComponent, null)
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                export default () => {
                  function UnstableNestedFunctionComponent() {
                    return <div />;
                  }

                  return (
                    <div>
                      <UnstableNestedFunctionComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                export default () => {
                  function UnstableNestedFunctionComponent() {
                    return React.createElement("div", null);
                  }

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedFunctionComponent, null)
                  );
                };
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                const ParentComponent = () => {
                  const UnstableNestedVariableComponent = () => {
                    return <div />;
                  }

                  return (
                    <div>
                      <UnstableNestedVariableComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                const ParentComponent = () => {
                  const UnstableNestedVariableComponent = () => {
                    return React.createElement("div", null);
                  }

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedVariableComponent, null)
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        // TODO: add support for class components detection
        // {
        //     code: dedent`
        //         function ParentComponent() {
        //           class UnstableNestedClassComponent extends React.Component {
        //             render() {
        //               return <div />;
        //             }
        //           };

        //           return (
        //             <div>
        //               <UnstableNestedClassComponent />
        //             </div>
        //           );
        //         }
        //     `,
        //     errors: [{ messageId: "INVALID" }],
        // },
        // TODO: add support for class components detection
        // {
        //     code: dedent`
        //         function ParentComponent() {
        //           class UnstableNestedClassComponent extends React.Component {
        //             render() {
        //               return React.createElement("div", null);
        //             }
        //           }

        //           return React.createElement(
        //             "div",
        //             null,
        //             React.createElement(UnstableNestedClassComponent, null)
        //           );
        //         }
        //     `,
        //     errors: [{ messageId: "INVALID" }],
        // },
        // TODO: add support for class components detection
        // {
        //     code: dedent`
        //         class ParentComponent extends React.Component {
        //           render() {
        //             class UnstableNestedClassComponent extends React.Component {
        //               render() {
        //                 return <div />;
        //               }
        //             };

        //             return (
        //               <div>
        //                 <UnstableNestedClassComponent />
        //               </div>
        //             );
        //           }
        //         }
        //     `,
        //     errors: [{ messageId: "INVALID" }],
        // },
        // TODO: add support for class components detection
        // {
        //     code: dedent`
        //         class ParentComponent extends React.Component {
        //           render() {
        //             class UnstableNestedClassComponent extends React.Component {
        //               render() {
        //                 return React.createElement("div", null);
        //               }
        //             }

        //             return React.createElement(
        //               "div",
        //               null,
        //               React.createElement(UnstableNestedClassComponent, null)
        //             );
        //           }
        //         }
        //     `,
        //     errors: [{ messageId: "INVALID" }],
        // },
        {
            code: dedent`
                class ParentComponent extends React.Component {
                  render() {
                    function UnstableNestedFunctionComponent() {
                      return <div />;
                    }

                    return (
                      <div>
                        <UnstableNestedFunctionComponent />
                      </div>
                    );
                  }
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                class ParentComponent extends React.Component {
                  render() {
                    function UnstableNestedClassComponent() {
                      return React.createElement("div", null);
                    }

                    return React.createElement(
                      "div",
                      null,
                      React.createElement(UnstableNestedClassComponent, null)
                    );
                  }
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                class ParentComponent extends React.Component {
                  render() {
                    const UnstableNestedVariableComponent = () => {
                      return <div />;
                    }

                    return (
                      <div>
                        <UnstableNestedVariableComponent />
                      </div>
                    );
                  }
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: `
            class ParentComponent extends React.Component {
              render() {
                const UnstableNestedClassComponent = () => {
                  return React.createElement("div", null);
                }

                return React.createElement(
                  "div",
                  null,
                  React.createElement(UnstableNestedClassComponent, null)
                );
              }
            }
          `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  function getComponent() {
                    function NestedUnstableFunctionComponent() {
                      return <div />;
                    };

                    return <NestedUnstableFunctionComponent />;
                  }

                  return (
                    <div>
                      {getComponent()}
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  function getComponent() {
                    function NestedUnstableFunctionComponent() {
                      return React.createElement("div", null);
                    }

                    return React.createElement(NestedUnstableFunctionComponent, null);
                  }

                  return React.createElement("div", null, getComponent());
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ComponentWithProps(props) {
                  return <div />;
                }

                function ParentComponent() {
                  return (
                    <ComponentWithProps
                      footer={
                        function SomeFooter() {
                          return <div />;
                        }
                      } />
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function ComponentWithProps(props) {
                  return React.createElement("div", null);
                }

                function ParentComponent() {
                  return React.createElement(ComponentWithProps, {
                    footer: function SomeFooter() {
                      return React.createElement("div", null);
                    }
                  });
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function ComponentWithProps(props) {
                  return <div />;
                }

                function ParentComponent() {
                    return (
                      <ComponentWithProps footer={() => <div />} />
                    );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function ComponentWithProps(props) {
                  return React.createElement("div", null);
                }

                function ParentComponent() {
                  return React.createElement(ComponentWithProps, {
                    footer: () => React.createElement("div", null)
                  });
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function RenderPropComponent(props) {
                  return props.render({});
                }

                function ParentComponent() {
                  return React.createElement(
                    RenderPropComponent,
                    null,
                    () => {
                      function UnstableNestedComponent() {
                        return React.createElement("div", null);
                      }

                      return React.createElement(
                        "div",
                        null,
                        React.createElement(UnstableNestedComponent, null)
                      );
                    }
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ComponentForProps(props) {
                  return <div />;
                }

                function ParentComponent() {
                  return (
                    <ComponentForProps notPrefixedWithRender={() => <div />} />
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function ComponentForProps(props) {
                  return React.createElement("div", null);
                }

                function ParentComponent() {
                  return React.createElement(ComponentForProps, {
                    notPrefixedWithRender: () => React.createElement("div", null)
                  });
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  return (
                    <ComponentForProps someMap={{ Header: () => <div /> }} />
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                class ParentComponent extends React.Component {
                  render() {
                    const List = () => {
                      return <ul>item</ul>;
                    };

                    return <List {...this.props} />;
                  }
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                class ParentComponent extends React.Component {
                  render() {
                    const List = (props) => {
                      const items = props.items
                        .map((item) => (
                          <li key={item.key}>
                            <span>{item.name}</span>
                          </li>
                        ));

                      return <ul>{items}</ul>;
                    };

                    return <List {...this.props} />;
                  }
                }
            `,
            // Only a single error should be shown. This can get easily marked twice.
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  return (
                    <SomeComponent>
                      {
                        thing.match({
                          loading: () => <div />,
                          success: () => <div />,
                          failure: () => <div />,
                        })
                      }
                    </SomeComponent>
                  )
                }
            `,
            errors: [
                { messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" },
                { messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" },
                { messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" },
            ],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const thingElement = thing.match({
                    loading: () => <div />,
                    success: () => <div />,
                    failure: () => <div />,
                  });
                  return (
                    <SomeComponent>
                      {thingElement}
                    </SomeComponent>
                  )
                }
            `,
            errors: [
                { messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" },
                { messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" },
                { messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" },
            ],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const rows = [
                    {
                      name: 'A',
                      notPrefixedWithRender: (props) => <Row {...props} />
                    },
                  ];

                  return <Table rows={rows} />;
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT_IN_PROPS" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const UnstableNestedComponent = React.memo(() => {
                    return <div />;
                  });

                  return (
                    <div>
                      <UnstableNestedComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const UnstableNestedComponent = React.memo(
                    () => React.createElement("div", null),
                  );

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedComponent, null)
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const UnstableNestedComponent = React.memo(
                    function () {
                      return <div />;
                    }
                  );

                  return (
                    <div>
                      <UnstableNestedComponent />
                    </div>
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
        {
            code: dedent`
                function ParentComponent() {
                  const UnstableNestedComponent = React.memo(
                    function () {
                      return React.createElement("div", null);
                    }
                  );

                  return React.createElement(
                    "div",
                    null,
                    React.createElement(UnstableNestedComponent, null)
                  );
                }
            `,
            errors: [{ messageId: "UNSTABLE_NESTED_COMPONENT" }],
        },
    ],
});
