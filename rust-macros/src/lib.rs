extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_attribute]
pub fn my_custom_attr(_attr: TokenStream, _input: TokenStream) -> TokenStream {
    TokenStream::from(quote! {
        #[derive(PartialEq)]
        struct H {
        pub foo: u32
    }})
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
