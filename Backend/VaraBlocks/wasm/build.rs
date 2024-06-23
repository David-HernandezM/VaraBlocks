use std::fs::File;
use sails_idl_gen::program;

use varablocks_app::{
    VaraBlocksProgram
};


fn main() {
    gwasm_builder::build();

    let idl_file_path = "./varablocks.idl";
    let idl_file = File::create(idl_file_path).unwrap();

    program::generate_idl::<VaraBlocksProgram>(idl_file).unwrap(); 
}