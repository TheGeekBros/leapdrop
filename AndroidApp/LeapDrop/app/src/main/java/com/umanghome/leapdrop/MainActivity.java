package com.umanghome.leapdrop;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.SurfaceTexture;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CameraMetadata;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.TotalCaptureResult;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.media.Image;
import android.media.ImageReader;
import android.os.Environment;
import android.os.Handler;
import android.os.HandlerThread;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.util.Size;
import android.util.SparseArray;
import android.util.SparseIntArray;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.TextureView;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;
import com.github.nkzawa.emitter.Emitter;

import com.google.android.gms.vision.CameraSource;
import com.google.android.gms.vision.Detector;
import com.google.android.gms.vision.barcode.Barcode;
import com.google.android.gms.vision.barcode.BarcodeDetector;

import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private String _BARCODE = "";
    private static String _IP = "172.23.0.179";
    private static String _PORT ="8765";
    private static Socket mSocket;

    private SurfaceView cameraView;

    EditText et_ip, et_port;
    Button go;

    String url = "http://" + _IP + ":" + _PORT;

    private Emitter.Listener sourceMessage = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Log.v("source", _BARCODE);
                    sendSource();
                }
            });
        }
    };

    private Emitter.Listener destinationMessage = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Log.v("destination", _BARCODE);
                    sendDestination();
                }
            });
        }
    };

    private void sendSource () {
        String id = _BARCODE;
        mSocket.emit("grabResponse", id);
    }

    private void sendDestination () {
        String id = _BARCODE;
        mSocket.emit("ungrabResponse", id);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

//        mSocket.emit("testEvent", "Test Message");

        cameraView = (SurfaceView) findViewById(R.id.camera_view);
        et_ip = (EditText) findViewById(R.id.ip);
        et_port = (EditText) findViewById(R.id.port);
        go = (Button) findViewById(R.id.go);

        et_ip.setText(_IP);
        et_port.setText(_PORT);

        go.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                url = "http://" + et_ip.getText().toString() + ":" + et_port.getText().toString();
                connect();
                go.setEnabled(false);
                Log.v("url", url);
            }
        });

        startCapturing();

    }

    private void startCapturing () {

        SparseArray<Barcode>[] DetectionsMain;

        BarcodeDetector barcodeDetector =
                new BarcodeDetector.Builder(this)
                        .setBarcodeFormats(Barcode.QR_CODE)
                        .build();

        final CameraSource cameraSource = new CameraSource
                .Builder(this, barcodeDetector)
                .setRequestedPreviewSize(640, 480)
                .build();

        cameraView.getHolder().addCallback(new SurfaceHolder.Callback() {
            @Override
            public void surfaceCreated(SurfaceHolder holder) {
                try {
                    cameraSource.start(cameraView.getHolder());
                } catch (IOException ie) {
                    Log.e("CAMERA SOURCE", ie.getMessage());
                }
            }

            @Override
            public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            }

            @Override
            public void surfaceDestroyed(SurfaceHolder holder) {
                cameraSource.stop();
            }
        });



        barcodeDetector.setProcessor(new Detector.Processor<Barcode>() {
            @Override
            public void release() {

            }

            @Override
            public void receiveDetections(Detector.Detections<Barcode> detections) {
                final SparseArray<Barcode> barcodes = detections.getDetectedItems();

                if (barcodes.size() != 0) {
//                    assert barcodeInfo != null;
//                    barcodeInfo.post(new Runnable() {    // Use the post method of the TextView
//                        public void run() {
//                            barcodeInfo.setText(    // Update the TextView
//                                    barcodes.valueAt(0).displayValue
//                                    /*****
//                                     *
//                                     * ENTER CODE FOR EVENTS AFTER DETECTING THE BARCODE
//                                     *
//                                     *
//                                     */
//                            );
//                            cameraSource.stop();
//                        }
//                    });
                    _BARCODE = barcodes.valueAt(0).displayValue;
                }
            }
        });

    }

    private void connect () {
        try {
            mSocket = IO.socket(url);
        } catch (URISyntaxException e) {
            Log.v("mSocket ma exception", e.getMessage());
        }

        mSocket.on("source", sourceMessage);
        mSocket.on("destination", destinationMessage);
        mSocket.connect();
        Log.v("onCreate", "Hopefully connected");

        mSocket.emit("iAmCamera", "");

        Toast.makeText(this, "Intitiated socket", Toast.LENGTH_SHORT).show();
    }

}