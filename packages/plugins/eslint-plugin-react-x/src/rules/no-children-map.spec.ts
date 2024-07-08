import { allValid, ruleTester } from "../../../../../test";
import rule, { RULE_NAME } from "./no-children-map";

ruleTester.run(RULE_NAME, rule, {
  invalid: [
    {
      code: /* tsx */ `
        import { Children } from 'react';

        function RowList({ children }) {
          return (
            <div className="RowList">
              {Children.map(children, child =>
                <div className="Row">
                  {child}
                </div>
              )}
            </div>
          );
        }
      `,
      errors: [{
        messageId: "NO_CHILDREN_MAP",
      }],
    },
    {
      code: /* tsx */ `
        const { Children } = require('react');

        function RowList({ children }) {
          return (
            <div className="RowList">
              {Children.map(children, child =>
                <div className="Row">
                  {child}
                </div>
              )}
            </div>
          );
        }
      `,
      errors: [{
        messageId: "NO_CHILDREN_MAP",
      }],
    },
    {
      code: /* tsx */ `
        import React from 'react';

        function RowList({ children }) {
          return (
            <div className="RowList">
              {React.Children.map(children, child =>
                <div className="Row">
                  {child}
                </div>
              )}
            </div>
          );
        }
      `,
      errors: [{
        messageId: "NO_CHILDREN_MAP",
      }],
    },
    {
      code: /* tsx */ `
        import * as React from 'react';

        function RowList({ children }) {
          return (
            <div className="RowList">
              {React.Children.map(children, child =>
                <div className="Row">
                  {child}
                </div>
              )}
            </div>
          );
        }
      `,
      errors: [{
        messageId: "NO_CHILDREN_MAP",
      }],
    },
  ],
  valid: [
    ...allValid,
    /* tsx */ `
      // import { Children } from 'react';

      const Children = {
        map: () => 1,
      }

      function RowList({ children }) {
        return (
          <div className="RowList">
            {Children.map(children, child => (
              <div className="Row">
                {child}
              </div>
            ))}
          </div>
        );
      }
    `,
    /* tsx */ `
      import { Children } from 'react';

      function SeparatorList({ children }) {
        const result = [];
        Children.forEach(children, (child, index) => {
          result.push(child);
          result.push(<hr key={index} />);
        });
        // ...
      }
    `,
  ],
});
