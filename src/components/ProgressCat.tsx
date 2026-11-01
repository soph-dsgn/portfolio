export function ProgressCat() {
  return <span className="canvas-progress-cat" aria-hidden="true">
    <span className="canvas-progress-cat__tail" />
    <span className="canvas-progress-cat__body">
      <span className="canvas-progress-cat__paw canvas-progress-cat__paw--left" />
      <span className="canvas-progress-cat__paw canvas-progress-cat__paw--right" />
    </span>
    <span className="canvas-progress-cat__head">
      <span className="canvas-progress-cat__ear canvas-progress-cat__ear--left" />
      <span className="canvas-progress-cat__ear canvas-progress-cat__ear--right" />
      <span className="canvas-progress-cat__eyes">
        <span className="canvas-progress-cat__eye" />
        <span className="canvas-progress-cat__eye" />
      </span>
    </span>
  </span>
}
