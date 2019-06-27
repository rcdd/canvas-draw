# CanvasDraw
CanvasDraw allows to draw over base64 image on html canvas without any dependencies.

## Installation

##### In the browser:
Download `canvasdraw.js` from `dist/` folder and place on assets folder or where you want and 
import in your project like this:
 
```html
<script src="assets/canvasdraw.js"></script>
```
##### With NPM:
```html
(TBD)
```

## Usage
#### Create a new instance of CanvasDraw:
```javascript
const canvasDraw = new CanvasDraw(options);
```
##### Options to use
| Options | Type | Required | Default | Description
| --- | --- | --- | :---: | --- |
| background | string | true | undefined | Image to draw and merge |
| parentElement | string | false | HTML Body | Class or Id of HTML element to place canvas |
| lineWidth | string | false | 8 | Width of line to draw on canvas |
| lineColor | string | false | #000 | Hex color line to draw on canvas |

#### Functions of CanvasDraw:
##### Clear()
 Clear all draw and reset the canvas.
```javascript
    canvasDraw.clear();
```

##### undo()
Do undo to canvas.
```javascript
    canvasDraw.undo();
```

##### save()
Returns the final canvas as base64 string or image element.
```javascript
    canvasDraw.save(options);
                       * options => Is an empty or string value.
```
| string |  Description
| --- | --- |
| (empty) | returns base64 string |
| 'png' | returns png image format |
| 'jpg' | returns jpg image format |
| 'tiff' | returns tiff image format |


##### update()
Update the instance with new values such as line width or color passed by object.
```javascript
    canvasDraw.update(options);
```
##### Options to use
| Options | Type | Description
| --- | --- | --- |
| lineWidth | string | Width of line to draw on canvas |
| lineColor | string | Hex color line to draw on canvas |

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
