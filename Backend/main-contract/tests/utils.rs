

// const USERS: &[u64] = &[3, 4, 5];

// pub fn init_main_contract(system: &System) {
//     sys.init_logger();

//     let main_contract = Program::from_file(system, "./../../target/wasm32-unknown-unknown/release/main_contract.wasm");

//     let mut res = main_contract.send(
//         USERS[0],
//         {}
//     );

//     assert!(!res.main_failed());
// }