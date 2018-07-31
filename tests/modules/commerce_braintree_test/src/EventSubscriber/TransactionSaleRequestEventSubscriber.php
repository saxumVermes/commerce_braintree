<?php

namespace Drupal\commerce_braintree_test\EventSubscriber;

use Drupal\commerce_braintree\Event\BraintreeEvents;
use Drupal\commerce_braintree\Event\TransactionSaleRequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class TransactionSaleRequestEventSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      BraintreeEvents::TRANSACTION_SALE_REQUEST => ['alterTransactionData', -100],
    ];
  }

  public function alterTransactionData(TransactionSaleRequestEvent $event) {
    $transactionData = $event->getTransactionData();

    /** @var \Drupal\address\AddressInterface $billingAddress */
    $billingAddress = $event->getPayment()->getOrder()->getBillingProfile()->address;

    $transactionData += [
      'billing' => [
        'firstName' => $billingAddress->getGivenName(),
        'secondName' => $billingAddress->getFamilyName(),
      ],
    ];

    $event->setTransactionData($transactionData);
  }

}
