<?php
if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $subject = $_POST['subject'];
    $email_from = $_POST['email'];
    $message = $_POST['message'];

    $email_to = "woodcharles544@gmail.com";
    $headers = "Message from: " .$email_from;
    $txt = "Someone from charlesw25.github.io sent you a message.\n\n" .$message;
    $send = mail($email_to, $subject, $txt, $headers);

    if ($send) {
        echo '<br>';
        echo 'Thanks for reaching out. I will get back to you shortly.';
    } else {
        echo 'Error. Make sure all forms are properly filled out and try again later.';
    }

    header("Location: charlesw25.github.io");
}
?>