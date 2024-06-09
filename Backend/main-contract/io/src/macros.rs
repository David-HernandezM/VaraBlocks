use gstd::{prelude::*, msg};

macro_rules! send_reply {
    ($event:expr) => {
        msg::reply($event, 0).expect("Error sending reply");
    }
}