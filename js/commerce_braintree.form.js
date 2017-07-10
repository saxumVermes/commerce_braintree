/**
 * @file
 * Defines behaviors for the Braintree payment method form.
 */

(function ($, Drupal, drupalSettings, braintree) {

  'use strict';

  /**
   * Attaches the commerceBraintreeForm behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the commerceBraintreeForm behavior.
   *
   * @see Drupal.commerceBraintree
   */
  Drupal.behaviors.commerceBraintreeForm = {
    attach: function (context) {
      var $form = $('.braintree-form', context).closest('form');
      if ($form.length === 0) {
        return;
      }

      var commerceBraintree = $form.data('braintree');
      if (!commerceBraintree) {
        var waitForSdk = setInterval(function () {
          if (typeof braintree !== 'undefined') {
            commerceBraintree = new Drupal.commerceBraintree($form, drupalSettings.commerceBraintree);
            $form.data('braintree', commerceBraintree);
            clearInterval(waitForSdk);
          }
        }, 100);
      }
    },
    detach: function (context, settings, trigger) {
      // Detaching on the wrong trigger will clear the Braintree form
      // on #ajax (after changing the address country, for example).
      if (trigger !== 'unload') {
        return;
      }
      var $form = $('.braintree-form', context).closest('form');
      if ($form.length === 0) {
        return;
      }

      var commerceBraintree = $form.data('braintree');
      if (commerceBraintree) {
        commerceBraintree.integration.teardown();
        $form.removeData('braintree');
      }
    }
  };

  /**
   * Wraps the Braintree object with Commerce-specific logic.
   *
   * @constructor
   */
  Drupal.commerceBraintree = function($form, settings) {
    this.settings = settings;
    this.$form = $form;
    this.formId = this.$form.attr('id');

    this.$form.find('#edit-submit').prop('disabled', false);

    this.$form.bind('submit', function (e) {
      $(this).find('.messages--error').remove()
    });

    braintree.setup(settings.clientToken, 'custom', {
      id: this.formId,
      hostedFields: settings.hostedFields,
      onReady: $.proxy(this.onReady, this),
      onError: $.proxy(this.onError, this),
      onPaymentMethodReceived: function (payload) {
        $('.braintree-nonce', $form).val(payload.nonce);
        $('.braintree-card-type', $form).val(payload.details.cardType);
        $('.braintree-last2', $form).val(payload.details.lastTwo);
        $form.submit();
      }
    });

    return this;
  };

  Drupal.commerceBraintree.prototype.onReady = function (integration) {
    this.integration = integration;
  };

  Drupal.commerceBraintree.prototype.onError = function (response) {
    if (response.type == 'VALIDATION') {
      var message = this.errorMsg(response);

      // Show the message above the form.
      this.$form.prepend(Drupal.theme('commerceBraintreeError', message));
    }
    else {
      console.log('Other error', arguments);
    }
  };

  Drupal.commerceBraintree.prototype.errorMsg = function(response) {
    var message;

    switch (response.message) {
      case 'User did not enter a payment method':
        message = Drupal.t('Please enter your credit card details.');
        break;

      case 'Some payment method input fields are invalid.':
        var fieldName = '';
        var fields = [];
        var invalidFields = this.$form.find('.braintree-hosted-fields-invalid');

        if (invalidFields.length > 0) {
          invalidFields.each(function(index) {
            var id = $(this).attr('id');
            // @todo Get the real label.
            var fieldName = id.replace('-', ' ');

            fields.push(Drupal.t(fieldName));
          });

          if (fields.length > 1) {
            var last = fields.pop();
            fieldName = fields.join(', ');
            fieldName += ' and ' + Drupal.t(last);
            message = Drupal.t('The @field you entered are invalid.', {'@field': fieldName});
          }
          else {
            fieldName = fields.pop();
            message = Drupal.t('The @field you entered is invalid.', {'@field': fieldName});
          }

        }
        else {
          message = Drupal.t('The payment details you entered are invalid.');
        }

        message += ' ' + Drupal.t('Please check your details and try again.');

        break;

      default:
        message = response.message;
    }

    return message;
  };

  $.extend(Drupal.theme, /** @lends Drupal.theme */{
    commerceBraintreeError: function (message) {
      return $('<div role="alert">' +
        '<div class="messages messages--error">' + message + '</div>' +
        '</div>'
      );
    }
  });

})(jQuery, Drupal, drupalSettings, window.braintree);
