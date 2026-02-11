<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HeritageSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            [
                'title' => 'Livres',
                'description' => "Ouvrages historiques et recueils littéraires du patrimoine national.",
                'icon' => 'library_books',
                'image_path' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBITFIPrXlrK_sX4lzqs74yHeyyg_ir4qWIb-0yMHo8UhqWcnpM4F_mWn1ZPWA5wMPRNvlfqGS_8u7IekgzfxGgdU5tYOx9LEXDSFzZesVBvxOrr34Cgzd7EStCxoqfZQ7CvqZ7yGKQBcoacGj09vrLW5hJ-x4SZnJBMzVfQJCcGkYFvtGiDGCMLcy4XBhDNT3YTEDBdPTwask6uOJFQQ_ioDkzV51u8Vygi0YlcHy2NDF3gU8ipR5OAXOJbwUti5X_JlUQf6MPBeHe',
                'link_url' => '/archives?type=livre',
                'order' => 1,
            ],
            [
                'title' => 'Manuscrits',
                'description' => "Traités, dahirs et écrits originaux à la plume.",
                'icon' => 'menu_book',
                'image_path' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7IYapK4EGetsL_RnTQwBUvwHL5a5B-qIjLOumYxyvWjE_JDl8rKzx0dljC3v_BkCs65Rw12yGxvrpqcboQPdZBp1UBYiBubcOz-u_hPBp5BH3_Wem9xWRsBv8U0oSLvoRsKfrvQuiiGJ-4F1EibEogb5Hz0KscEJNDk_XBa49-ZG0r32EVY6CaCk0QQ7m19zWjd1N3YWPOpVdHluSJUdvBh6OwEpxH29OtKX9Qp5cgNPFomhLOhMFF53VZ9nKHx_elUkIMOIKfj3x',
                'link_url' => '/archives?type=pdf',
                'order' => 2,
            ],
            [
                'title' => 'Vidéos',
                'description' => "Archives cinématographiques et témoignages visuels du passé.",
                'icon' => 'videocam',
                'image_path' => 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
                'link_url' => '/archives?type=video',
                'order' => 3,
            ],
            [
                'title' => 'Cartes',
                'description' => "Plans anciens et cartographie de l'évolution du Royaume.",
                'icon' => 'map',
                'image_path' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNl4A1QMa3XiOj2YLC-rPfz3YGjhDuA6IYuV5v53NFIlqTEWoPDZYS3lT2mHqFbLTApk3qZQbYlpCew2T6tfoDZrzBB5nw7_8M9_O3TQZOHBHt4nf6oy16c4rbNVxn6gslN5IJn-j5v9W6MT0YGi0tI6WIZPI0c8hi-mR5qplyULQ8vXlDJTv1BSR7Qqocc1Yh7lnq5ZOFU8MsH3fQlusRFJk2Iug6oEKsm0FACTJOL2hIC-3VG0CXpjTM5-lQOFZBJ3UpbHutM2OL',
                'link_url' => '/archives?type=carte',
                'order' => 4,
            ],
            [
                'title' => 'Photos',
                'description' => "Clichés historiques et gravures d'époque.",
                'icon' => 'photo_library',
                'image_path' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhELtUk_EWB0svCP1CPN5I7_GjmSkaruom8rn-0NGIC9XWgHPHbmHNweG07Eh_bDyo1_iHvXNb47cJWohcfMM5SFh0ZyaMQcG76trgeHe7vPXj-pBxlsLBmABAFgjS0Ut1E7Qj7aJqk-zn2jcDtK51e8vwc7BBAz6doa3krqxYLN_WawebcbKvsNVhyGNr_W0U9wqvmjuDtNbX9M4zPBPZcyEtYyKPsi-baMAJLyk2lY05y7BlU7xrLrkeBdAzRrj4oNa88HjxG8hO',
                'link_url' => '/archives?type=image',
                'order' => 5,
            ],
        ];

        foreach ($sections as $section) {
            \App\Models\HeritageSection::create($section);
        }
    }
}
