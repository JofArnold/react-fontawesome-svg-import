# react-fontawesome-svg-import

Generates a Reactjs module from Font Awesome raw svgs. The generated module is of the format:

```
import React from "react";

const BrandsSlackHash = ( {className} ) => <svg className={className || } ... ><path .... /></svg>;
const LightArrowAltUp = ( {className} ) => <svg className={className || } ... ><path .... /></svg>;

export {
  BrandsSlackHash,
  LightArrowAltUp,
}
```

I.e. the modules are a module case concatenation of their file name and their parent directory. For example `.../brands/slack-hack.svg` gets the name `BrandsSlackHash`.


### Example Usage

#### Example Directory Structure

```
├── scripts
│   └── generate-svg-components.js
├── src
│   ├── components
│   │   └── SVGIcon.js // <-- used in the example
│   ├── icons
│   │   ├── SVGs.js // <-- generated
│   │   ├── brands
│   │   │   ├── bitbucket.svg
│   │   │   ├── github-alt.svg
│   │   │   ├── github-square.svg
│   │   └── light
│   │       ├── address-book.svg
│   │       ├── address-card.svg

```

In root you'd run `node ./scripts/generate-svg-components.js -i src/icons/ -o src/icons/SVGs.js` which would generate the SVGs.js file.

#### Example Component

```
// src/components/SVGIcon.js

import React, { Component } from "react";
import camelCase from "lodash/camelCase";
import * as Icons from "../icons/SVGs";

const moduleCase = str => {
  const first = str.substr(0, 1).toUpperCase();
  const rest = camelCase(str.substr(1));
  return `${first}${rest}`;
};

class SVGIcon extends Component {
  render() {
    const { type = "regular", name = "affiliatetheme" } = this.props;
    const IconClass = Icons[moduleCase(`${type}-${name}`)];
    return (
      <span className="displayInlineFlex heightAdjust widthAdjust">
        <IconClass className="heightAdjust widthAdjust fillCurrent" />
      </span>
    );
  }
}

export default SVGIcon;

```

```
// styles.css

.heightAdjust { height: 1em }
.widthAdjust { height: 1em }
.fillCurrent { fill: currentColor }
.displayInlineFlex { display: inline-flex }
.makeIconBigUsingFontSize { font-size: 200px }
.makeIconRedUsingTextColor { color: red }
```

```
// src/components/IconsInUse.js
import React, { Component } from "react";
import SVGIcon from "./SVGIcon";

class App extends Component {
  render() {
    return (
        <div className="makeIconBigUsingFontSize makeIconRedUsingTextColor">
          <SVGIcon name="address-book" type="light" />{" "}
          <SVGIcon name="github-alt" type="brands" />{" "}
        </div>
      </div>
    );
  }
}

export default App;
```


### TODO

- Turn into npm module.
- Handle errors.
- Process output through prettier
