import React, { FunctionComponent } from 'react';
import { Route, Switch } from 'react-router-dom';

const { default: Shell, ...routes } = require('__APP__');
const routeList = Object.values(routes) as Array<{
  path: string;
  component: FunctionComponent;
}>;

export default function SharedEntry() {
  return (
    <Shell>
      <Switch>
        {routeList.map(({ path, component: Component }) => (
          <Route key={path} path={path}>
            <Component />
          </Route>
        ))}
      </Switch>
    </Shell>
  );
}
