import logging
import logging.handlers

#LOG_FILENAME = "logs/debug_log"

app_logger = logging.getLogger()
app_logger.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s (%(filename)-15s:%(lineno)4d)|%(levelname)8s| %(message)s")  # will show up in terminal with CherryPy and error_log with Apache, perfect 

ch = logging.StreamHandler() 
ch.setLevel(logging.WARNING) 
ch.setFormatter(formatter) 
app_logger.addHandler(ch)

#fh = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=500, backupCount=10)
#fh.setLevel(logging.DEBUG)
#fh.setFormatter(formatter)
#app_logger.addHandler(fh)