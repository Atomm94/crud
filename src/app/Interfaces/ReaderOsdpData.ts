export interface IReaderOsdpData {
    baud_rate: number,
    card_data_format_flags: number,
    keypad_mode: number,
    configuration: number,
    led_mode: number | null,
    offline_mode: number,
    enable_osdp_secure_channel: boolean,
    enable_osdp_tracing: boolean,
}
