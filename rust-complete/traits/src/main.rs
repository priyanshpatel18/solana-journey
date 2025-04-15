struct Rect {
  width: f64,
  height: f64,
}

trait Shape {
  fn area(&self) -> f64;
}

impl Shape for Rect {
  fn area(&self) -> f64 {
      self.width * self.height
  }
}

fn main() {
  let r = Rect {
      width: 10.10,
      height: 20.20,
  };

  println!("Area: {}", get_area(r));
}

fn get_area(shape: impl Shape) -> f64 {
  shape.area()
}
