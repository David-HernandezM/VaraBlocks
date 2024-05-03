use gstd::{prelude::*, msg, exec, collections::{BTreeMap, HashMap}, ReservationId};

use contract_test_io::*;

#[no_mangle]
extern "C" fn intit() {
}

#[no_mangle]
extern "C" fn handle() {
    let message = msg::load()
        .expect("Error loading message");

    match message {
        ContractAction::ReceiveMessage => {
            msg::reply(ContractEvent::OneMessage, 0)
                .expect("Error sending reply");
        },
        ContractAction::ReceiveNumOfMessages(total_messages) => {
            for i in 1..=total_messages {
                msg::send(msg::source(), ContractEvent::MessageForNumOfMessages { message_num: i }, 0)
                    .expect("Error sending message");
            }

            msg::reply(ContractEvent::MessagesSend, 0)
                .expect("Error sending reply");
        }
    }
}

#[no_mangle]
extern "C" fn state() {}
