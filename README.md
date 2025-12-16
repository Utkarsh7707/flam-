**Interactive Physics Bézier Curve**

1. The Math: Cubic Bézier Curve

The visual backbone of the project is a cubic Bézier curve. It’s defined by four points:

    P₀ and P₃ → fixed anchor points (the ends of the curve)
    P₁ and P₂ → control points that shape the curve

For a given parameter t between 0 and 1, the position on the curve is computed using the
standard cubic Bézier equation:

    B(t) = (1 - t)³ P₀
         + 3(1 - t)² t P₁
         + 3(1 - t) t² P₂
         + t³ P₃

This equation is evaluated repeatedly across t to draw the smooth blue curve you see on
the canvas.


Tangents (Derivatives)

To visualize how the curve is flowing, the first derivative of the Bézier equation is used:

    B'(t) = 3(1 - t)² (P₁ - P₀)
          + 6(1 - t) t (P₂ - P₁)
          + 3 t² (P₃ - P₂)

These derivative vectors represent the tangent direction at each point along the curve.
After normalizing them, short orange lines are drawn so their direction is clear without
their magnitude getting in the way.


2. The Physics: Spring-Based Control Points

Instead of dragging control points directly, this project treats P₁ and P₂ as physical
particles connected to invisible target positions by springs.


Spring Force (Hooke’s Law)

Each control point is pulled toward its target using a simple spring equation:

    F = -k · (x_current - x_target)

This force is applied every frame, accelerating the point toward where it wants to be.


Mouse Interaction

    • When the mouse is active, the target positions move with it
      (with a small horizontal offset so the points don’t collapse).

    • When the mouse leaves, the targets reset to their resting positions,
      and the springs pull the curve back into place.


Damping

To prevent endless oscillation, velocity is reduced every frame:

    v_new = v_old · damping

This mimics friction or air resistance and allows the system to settle smoothly.


3. Design & Implementation Notes

Canvas API
    Canvas is used for its simplicity and performance. The entire scene is redrawn
    every frame, which works well here and avoids unnecessary DOM overhead.

Visual Separation
    Blue   (#2563eb) → the Bézier curve itself (the result)
    Orange (#f59e0b) → tangent vectors (the math)
    Red    (#ef4444) → control points (the physics objects)

Interaction Feel
    There is no click-and-drag interaction. The mouse acts like a magnetic influence,
    making the curve feel weighted and elastic rather than rigid and mechanical.


Overall, this project is meant as a small bridge between math and motion — showing how
simple equations and basic physics can produce expressive, almost tactile results when
combined thoughtfully.
