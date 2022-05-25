#[macro_export]
macro_rules! publ {
    ($(#[$meta:meta])*
    $vis:vis struct $name:ident {
        $(
			$(#[$field_meta:meta])*
        	$field_vis:vis $field_name:ident : $field_type:ty
		),* $(,)*
    }) => {
        $(#[$meta])*
        pub struct $name {
            $(
				$(#[$field_meta])*
				pub $field_name : $field_type,
			)*
        }
    }
}

mod test_mod {
    publ! {
        #[derive(PartialEq)]
        struct PubStruct {
            some_field: u32,
            some_field2: u32,
        }
    }
}

use test_mod::PubStruct;

#[test]
fn first_test() {
    let p = PubStruct {
        some_field: 1,
        some_field2: 2,
    };

    assert!(p == p)
}
