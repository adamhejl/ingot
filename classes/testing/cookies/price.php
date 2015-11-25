<?php
/**
 * Setsups price cookies
 *
 * @package   ingot
 * @author    Josh Pollock <Josh@JoshPress.net>
 * @license   GPL-2.0+
 * @link
 * @copyright 2015 Josh Pollock
 */

namespace ingot\testing\cookies;


use ingot\testing\crud\price_group;
use ingot\testing\crud\price_test;
use ingot\testing\crud\sequence;
use ingot\testing\crud\test;
use ingot\testing\tests\chance;
use ingot\testing\tests\flow;
use ingot\testing\utility\helpers;

class price {

	/**
	 * The price cookie
	 *
	 * @since 0.2.0
	 *
	 * @access protected
	 *
	 * @var array
	 */
	private $price_cookie;

	/**
	 * Current price sequences
	 *
	 * @since 0.2.0
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $current_sequences = array();

	/**
	 * Construct object
	 *
	 * @since 0.0.9
	 *
	 * @param array $current_sequences Current sequences
	 * @param array $price_cookie Price cookie portion of our cookie
	 * @param bool $reset Optional. Whether to rest or not, default is false
	 */
	public function __construct( $current_sequences, $price_cookie, $reset = true ){
		if ( false == $reset  ) {
			$this->price_cookie = $price_cookie;
		}else{
			$this->price_cookie = array();
		}

		$this->current_sequences = $current_sequences;

		if( ! empty( $this->current_sequences )) {
			$this->check_sequences();
			$this->check_sequence_lives();
		}
	}

	/**
	 * Get price cookie
	 *
	 * @since 0.0.9
	 *
	 * @return array Price cookie portion of our cookie
	 */
	public function get_price_cookie() {
		return $this->price_cookie;
	}



	/**
	 * Make sure all current sequences are set
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 *
	 */
	protected function check_sequences(){
		$current_ids_in_cookie = array_keys( $this->price_cookie );
		foreach( $this->current_sequences as $sequence_id => $sequence ){
			if( ! in_array( $sequence_id, $current_ids_in_cookie ) ){
				$this->add_test( $sequence );
			}
		}
	}

	/**
	 * Ensure all tests are not expired and refresh if needed
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 */
	protected function check_sequence_lives() {
		$now = time();
		foreach( $this->price_cookie as $sequence_id => $test ){
			$expires = helpers::v( 'expires', $test, 0 );
			if( $now < $expires ) {
				$this->refresh_test( $sequence_id );
			}

		}

	}

	/**
	 * Refresh an expired test
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 *
	 * @param int $sequence_id
	 */
	protected function refresh_test( $sequence_id ){
		if( array_key_exists( $sequence_id, $this->current_sequences ) ){
			$sequence = $this->current_sequences[ $sequence_id ];
		}else{
			$sequence = sequence::read( $sequence_id );
		}

		if( is_array( $sequence ) ){
			$this->add_test( $sequence );
		}
	}


	/**
	 * Add a test
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 *
	 * @param array $sequence
	 */
	protected function add_test( $sequence ){
		$a_or_b = $this->a_or_b( $sequence, false );
		$group = price_group::read( $sequence[ 'group_ID' ] );
		if ( is_array( $group ) ) {
			$test_id = $this->get_test_id( $sequence, $a_or_b );
			$test = test::read( $test_id );
			$test_details = \ingot\testing\utility\price::price_detail( $test_id, $a_or_b, $sequence[ 'ID' ], $group );

			$this->price_cookie[ $sequence[ 'ID' ] ] = $test_details;
		}

	}

	/**
	 * Determine a or b
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 *
	 * @param array $sequence
	 *
	 * @return bool|string
	 */
	protected function a_or_b( $sequence ) {
		$chance = new chance( $sequence );
		$a_or_b = flow::choose_a( $chance->get_chance(), false );

		return $a_or_b;
	}

	/**
	 * Find test ID by a or b
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 *
	 * @param array $sequence
	 * @param string $a_or_b
	 *
	 * @return mixed
	 */
	protected function get_test_id( $sequence, $a_or_b ) {
		if ( 'a' == $a_or_b ) {
			$test_id = $sequence['a_id'];
		} else {
			$test_id = $sequence['b_id'];
		}

		return $test_id;
	}

	/**
	 * Get expiration time for tests
	 *
	 * @todo filter/option/etc?
	 *
	 * @since 0.0.9
	 *
	 * @access protected
	 *
	 * @return int
	 */
	protected function expires() {
		return time() + ( 10 * DAY_IN_SECONDS );

	}

}
