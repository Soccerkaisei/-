<?php
/* ともだちじゃぱん：英語の先生一覧（/en/our-teachers/・ページ214）に、
   英語の先生ページがまだ1つも無いあいだだけ、日本語の先生ページ（親128）を英語のラベルで並べる。
   元の自動一覧（優先度20）より先に動くように、優先度19にしている。
   英語の先生ページが1つでも公開されたら、このスニペットは何もしない（元の自動一覧が表示される）。 */

add_filter( 'the_content', 'tj_teacher_list_en_fallback', 19 );

function tj_teacher_list_en_fallback( $content ) {

	if ( ! is_page( 214 ) || ! in_the_loop() || ! is_main_query() ) { return $content; }

	$en = get_posts( array(
		'post_type'   => 'page',
		'post_parent' => 214,
		'post_status' => 'publish',
		'numberposts' => 1,
		'fields'      => 'ids',
	) );
	if ( $en ) { return $content; }

	$kids = get_posts( array(
		'post_type'   => 'page',
		'post_parent' => 128,
		'post_status' => 'publish',
		'numberposts' => 50,
		'orderby'     => 'menu_order title',
		'order'       => 'ASC',
	) );

	$cards = '';
	foreach ( $kids as $k ) {
		if ( ! empty( $k->post_password ) ) { continue; }

		$photo  = (string) get_post_meta( $k->ID, '_tj_p_t-photo1', true );
		$nm     = (string) get_post_meta( $k->ID, '_tj_f_t-name', true );
		$romaji = trim( (string) get_post_meta( $k->ID, '_tj_f_t-romaji', true ) );
		if ( $nm === '' ) { $nm = str_replace( '先生', '', $k->post_title ); }
		$en_name = $romaji !== '' ? ucwords( strtolower( $romaji ) ) . '-sensei' : $nm . ' sensei';

		$img = $photo
			? '<img src="' . esc_url( $photo ) . '" alt="' . esc_attr( $en_name ) . '" loading="lazy" style="width:118px;height:118px;object-fit:cover;border-radius:50%;border:4px solid #fff;box-shadow:var(--tjx-shadow-sm);margin:0 auto 12px;display:block" />'
			: '<div style="width:118px;height:118px;border-radius:50%;background:var(--tjx-tint);margin:0 auto 12px"></div>';

		$url  = get_permalink( $k->ID );
		$btns = '<div style="display:grid;gap:9px;margin-top:18px">'
			. '<a href="' . esc_url( $url ) . '" style="display:block;text-align:center;text-decoration:none;background:#fff;color:var(--tjx-teal-deep);border:2px solid var(--tjx-teal);border-radius:999px;padding:11px 16px;font-family:\'Zen Maru Gothic\',sans-serif;font-weight:700;font-size:.92rem">View profile (in Japanese)</a>';
		if ( trim( (string) get_post_meta( $k->ID, '_tj_f_t-calcom', true ) ) !== '' ) {
			$btns .= '<a href="' . esc_url( $url . '#taiken' ) . '" style="display:block;text-align:center;text-decoration:none;background:var(--tjx-coral);color:#fff;border:2px solid transparent;border-radius:999px;padding:11px 16px;font-family:\'Zen Maru Gothic\',sans-serif;font-weight:700;font-size:.92rem;box-shadow:0 12px 26px -14px var(--tjx-coral)">Book a free trial →</a>';
		}
		$btns .= '</div>';

		$cards .= '<div style="display:flex;flex-direction:column;background:#fff;border:1px solid var(--tjx-line);border-radius:22px;padding:26px 24px;box-shadow:var(--tjx-shadow-sm);text-align:center">'
			. $img
			. '<p style="font-family:\'Zen Maru Gothic\',sans-serif;font-weight:700;font-size:1.15rem;color:var(--tjx-ink);margin:0">' . esc_html( $en_name ) . '</p>'
			. '<p style="color:var(--tjx-faint);font-size:.82rem;margin:4px 0 0">' . esc_html( $nm ) . '先生</p>'
			. '<div style="flex:1"></div>' . $btns . '</div>';
	}

	if ( $cards === '' ) { return $content; }

	$section = '<div class="wp-block-group alignfull tjx-band tjx-tintbg"><div class="tjx-wrap">'
		. '<div class="tjx-shead" style="text-align:center"><span class="tjx-eyebrow">Teachers</span>'
		. '<h2 class="tjx-h2">Our <span class="k">teachers.</span></h2>'
		. '<p class="tjx-lead">Teacher profiles are in Japanese for now. English versions are coming soon.</p></div>'
		. '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;max-width:1000px;margin:28px auto 0">'
		. $cards . '</div></div></div>';

	/* 元の一覧と同じく、差し込み口（<!--TJ_TEACHERS-->）があればそこにカードを入れる。無ければページの最後に足す */
	if ( strpos( $content, '<!--TJ_TEACHERS-->' ) !== false ) {
		return str_replace( '<!--TJ_TEACHERS-->', $cards, $content );
	}
	return $content . $section;
}
