from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Trade:
    id: int
    buy_sell_indicator: str
    product_type: str
    cusip: str
    isin: str
    trade_date: datetime
    settlement_date: datetime
    quantity: float
    price: float
    account_number: str
    counterparty_dtc_number: str
    counterparty_name: str
    currency: str
    accrued_interest: float
    fees: float
    settlement_location: str
    settlement_status: str

@dataclass
class RiskParameters:
    max_unsettled_trades: int
    max_counterparty_exposure: float
    max_single_trade_value: float 