<?php

namespace Drupal\commerce_braintree\Event;

/**
 * Defines events for Braintree transactions.
 */
final class BraintreeEvents {

  /**
   * Name of the event fired when performing sale request.
   *
   * @Event
   */
  const TRANSACTION_SALE_REQUEST = 'commerce_braintree.transaction_sale_request';

}
