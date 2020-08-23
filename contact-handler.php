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
    header("Location: charlesw25.github.io");
}
?>