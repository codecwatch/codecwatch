A video encoding benchmark platform
==================

Basic idea, with Amazon EC2 instances
------------------

~~~~~~~
          [Master]    Communicate
         /    |    \      <=>      [Amazon S3]
   [Slave] [Slave]  …              [ Bucket  ]
~~~~~~~

* S3 volume contains:
    * Set of standard videos
    * Parameters for each encoder
* Master splits the set of videos between each slave
* Each slave runs one encode on each of its core
* Once an encode is done, objective metrics (PSNR, SSIM, …) are calculated then
  the encode and the metrics are copied to the S3 volume. If the video is
  chunked, the chunks are concatenated.

Instead of doing all of this ourselves, use [OSCIED](https://github.com/codecwatch/OSCIED)
------------------
* Already takes care of distributed encoding
* Needs to be extended for nightly encodes, metrics calculations and display, etc.

Frontend
------------------
* The web frontend displaying the results run on the dataset (since it's mostly
  idle otherwise)
* It can also be used to download/stream the videos
* The encoder binaries are stored on S3 and periodically updated, then a new set
  of encode is triggered.
* When a privileged user asks for it, an encoder is rebuilt from his git branch
  and a new set of encode is triggered.
* A privileged user can upload new videos which will be:
    * Decoded to a raw format (fast)
    * Split into 5-sec chunks (easy for raw video)

Requirements
------------------
1. Storage:
    * Raw video take an enormous amount of space! (eg: 1 second of raw 1080p50
      YUV420: 1920 ⨯ 1080 ⨯ 3/2 ⨯ 50 B ~= 148 MB).
    * Need to use lossless compression, but slaves need to be able to handle 5
      seconds of raw video for each core.
    * 8 core slave: 6GB of temporary space needed.
2. CPU: Assuming we want to encode a set of 20 5-secs videos nightly and still
   have slaves free for manual encodes, we need at least 3 slaves: at 0.02 fps,
   encoding 5 seconds will take 7 hours. If we have 20 cores available, can run
   20 encodings

Team roles:
------------------
* Video pipeline handling: Guillaume Martres
* Backend: Axel Angel
* Frontend: Luca La Spada

Deliverables (updated)
------------------
* April 14:
  * Guillaume: fixed various bugs in OSCIED to make it usable
  * Axel: Set up the servers, work on using OSCIED on Azure
  * Luca: The frontend can display simple stats like http://arewefastyet.com
* May 7:
  * Guillaume: upgrade OSCIED to work on the latest version of Ubuntu (needed for Azure support)  
  * Axel: Encoding tasks collect metrics to be displayed in the UI
  * Luca: the frontend is more usable and can display data from multiple encoders and multiple files at once
* May 13:
  * Guillaume: Support for user accounts which can trigger a set of encodes using an encoder built from their git branch.
  * Luca: The frontend can be used to download/stream the videos and to compare them like http://exp.martres.me/splitview/ .
