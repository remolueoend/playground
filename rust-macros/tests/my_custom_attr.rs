use rust_macros::*;

#[my_custom_attr]
struct S {}

#[test]
fn first_test() {
    let h = H { foo: 1 };
    assert!(h == h);
}
