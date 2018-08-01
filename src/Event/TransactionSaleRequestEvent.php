<?php

namespace Drupal\commerce_braintree\Event;

use Drupal\commerce_payment\Entity\PaymentInterface;
use Symfony\Component\EventDispatcher\Event;

/**
 * Defines transaction sale request event.
 *
 * @see \Drupal\commerce_braintree\Event\BraintreeEvents
 */
class TransactionSaleRequestEvent extends Event {

  /**
   * Transaction sale request data.
   *
   * @var array
   */
  protected $transactionData;

  /**
   * Payment object.
   *
   * @var \Drupal\commerce_payment\Entity\PaymentInterface
   */
  protected $payment;

  public function __construct(array $transactionData, PaymentInterface $payment) {
    $this->transactionData = $transactionData;
    $this->payment = $payment;
  }

  public function getTransactionData() {
    return $this->transactionData;
  }

  public function getPayment() {
    return $this->payment;
  }

  /**
   * Alters transaction data.
   *
   * @param array $transactionData
   *
   * @return $this
   */
  public function setTransactionData(array $transactionData) {
    $this->transactionData = $transactionData;
    return $this;
  }

}
